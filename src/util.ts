import * as prompt from 'prompt';
import debugFactory from 'debug';
import {fetch} from './fetch';
import {getToken, writeToken} from './token';
import {fromCallback} from './util/promise';

interface Target {
    receiver: string;
    path: string;
}

type Callback = (error?: Error) => void;

const waiting: Callback[] = [];
const debug = debugFactory('fhp');
prompt.start();

function resolve(err?: Error) {
    while (waiting.length) {
    waiting.pop()!(err);
    }
}

const defaultReadEmail = savedEmail => fromCallback<{email: string}>(cb => prompt.get({
    'properties': {
        'email': {
            'default': savedEmail,
            'description': 'Enter your email',
            'message': 'The specified value must be a valid email address.',
            // eslint-disable-next-line
            pattern: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,
            'required': true
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

export function requireEmail(options, prevError, cb: Callback) {
    debug('require email called');
    const {
        authAPI,
        validateAPI,
        readEmail = defaultReadEmail,
        readCode = defaultReadCode
    } = options;

    if (!authAPI || !validateAPI) {
        return cb(new Error('options.authAPI and options.validateApi is required!'));
    }

    waiting.push(cb);
    // already getting
    if (waiting.length > 1) {
        debug('already requiring, skip');
        return;
    }

    const info = getToken();
    if (info.email) {
        process.stdout.write('Token is invalid: ' + prevError.errmsg + '\n');
    }

    debug('reading email...');
    readEmail(info.email).then(email => {
        debug('email input:', email);
        info.email = email;
        writeToken(info);

        fetch(authAPI, {email}, err => {
            if (err) {
                return resolve(err);
            }

            process.stdout.write('We\'ve already sent the code to your email.\n');
            requireToken(validateAPI, info, readCode, resolve);
        });
    }).catch(error => resolve(error));
}

function requireToken(validateApi, info, readCode, cb) {
    debug('reading code...');
    readCode().then(code => {
        debug('email input:', code);
        info.code = code;
        writeToken(info);
        fetch(validateApi, {
            'code': info.code,
            'email': info.email
        }, (err, rs) => {
            if (err) {
                return cb(err);
            }

            info.token = rs.data.token;
            writeToken(info);
            cb(null, info);
        });
    }).catch(error => cb(error));
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
