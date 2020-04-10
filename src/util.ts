import * as prompt from 'prompt';
import debugFactory from 'debug';
import {fetch} from './fetch';
import {getToken, writeToken} from './token';
import {fromCallback} from './util/promise';
import {log} from './util/log';

interface Target {
    receiver: string;
    path: string;
}

type Callback = (error?: Error) => void;

const debug = debugFactory('fhp');
prompt.start();

const defaultReadEmail = savedEmail => fromCallback<{email: string}>(cb => prompt.get({
    properties: {
        email: {
            default: savedEmail,
            description: 'Enter your email',
            message: 'The specified value must be a valid email address.',
            pattern: /^([\w-.]+)@([\w-.]+)\.([a-z]{2,5})$/i,
            required: true
        }
    }
}, cb)).then(ret => ret.email);

const defaultReadCode = () => fromCallback<{code: string}>(cb => prompt.get({
    'properties': {
        'code': {
            'description': 'Enter your code',
            'hide': true,
            'required': true
        }
    }
}, cb)).then(ret => ret.code);

export async function authenticate(options, prevError): Promise<any> {
    debug('require email called');
    const {
        authAPI,
        validateAPI,
        readEmail = defaultReadEmail,
        readCode = defaultReadCode
    } = options;

    const info = getToken();
    if (info.email) {
        process.stdout.write('Token is invalid: ' + prevError.errmsg + '\n');
    }

    debug('reading email...');
    return readEmail(info.email).then(email => {
        debug('email input:', email);
        info.email = email;
        writeToken(info);

        return new Promise((resolve, reject) => {
            fetch(authAPI, {email}, err => {
                if (err) return reject(err);

                log('We\'ve already sent the code to your email.');
                requireToken(validateAPI, info, readCode)
                    .then(ret => resolve(ret))
                    .catch(err => reject(err));
            });
        });
    });
}

function requireToken(validateApi, info, readCode) {
    debug('reading code...');
    return readCode().then(code => {
        debug('email input:', code);
        info.code = code;
        writeToken(info);
        return new Promise((resolve, reject) => {
            fetch(validateApi, {
                'code': info.code,
                'email': info.email
            }, (err, rs) => {
                if (err) {
                    return reject(err);
                }

                info.token = rs.data.token;
                writeToken(info);
                resolve(info);
            });
        });
    });
}

export function parseTargetUrl(urlStr: string): Target {
    const url = new URL(urlStr);
    return {
        'receiver': url.origin,
        'path': url.pathname
    };
}

type ParallelFn = (...args: any[]) => Promise<any>;
type FinishHandle = (totalCount: number, successCount: number, failCount: number) => any;
export function parallelFactory(fn: ParallelFn, parallelCount: number, finishHandle?: FinishHandle) {
    const pool: any[][] = [];
    let executingCount = 0;
    let totalCount = 0;
    let successCount = 0;
    let failCount = 0;

    function entry(...args: any[]) {
        pool.push(args);
        exec();
    }

    function done() {
        executingCount--;
        exec();
    }

    function exec() {
        if (!pool.length && !executingCount) {
            if (finishHandle) {
                finishHandle(totalCount, successCount, failCount);
            }
            totalCount = successCount = failCount = 0;
            return;
        }

        /* eslint-disable no-loop-func */
        while (pool.length && executingCount < parallelCount) {
            executingCount++;
            totalCount++;
            const args = pool.shift()!;
            fn(...args)
                .then(() => {
                    successCount++;
                    done();
                })
                .catch(() => {
                    failCount++;
                    done();
                });
        }
        /* eslint-enable no-loop-func */
    }

    return entry;
}

export function wait(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
