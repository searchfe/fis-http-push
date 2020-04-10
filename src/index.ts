import fs from 'fs';
import debugFactory from 'debug';
import {upload} from './upload';
import {requireEmail, parallelFactory, wait} from './util';
import {fromCallback} from './util/promise';
import {success} from './log';

type OnEnd = (totalCount: number, successCount: number, failCount: number) => void
type OnProcess = (options: { path: string, to: string }) => void
const defaultOnEnd = (totalCount, successCount, failCount) => {
    success(`total ${totalCount}, success ${successCount}, fail ${failCount}`);
};
const debug = debugFactory('fhp');

interface PushOptions {
    receiver: string;
    retry?: number;
    parallelPushCount?: number;
    uploadAPI?: string;
    authAPI?: string;
    validateAPI?: string;
    onEnd?: OnEnd;
    onProcess?: OnProcess;
    readEmail?: (savedEmail: string) => Promise<string>;
    readCode?: () => Promise<string>;
}

// 新接口，先包装旧接口实现
export function push(path: string, to: string, options: PushOptions) {
    const push = pushFactory(options);
    return fromCallback(cb => push(path, to, path, cb));
}

// 给 makit-plugin 用，旧接口，逐步改造掉
export function pushFactory(options: PushOptions) {
    options = normalize(options);
    const {
        uploadAPI,
        retry, parallelPushCount,
        onEnd,
        onProcess
    } = options;

    return parallelFactory(push, parallelPushCount, onEnd || defaultOnEnd);

    function authenticate(error) {
        return new Promise((resolve, reject) => {
            debug('requiring email');
            requireEmail(options, error, err => {
                debug('require email returned', err);
                if (err) {
                    return reject(new Error('Auth failed! ' + err['errmsg']));
                }
                resolve();
            });
        });
    }

    function push(path, to, dep, done, availableRetry = retry) {
        // 强制挂掉
        if (!uploadAPI) {
            throw new Error('options.receiver is required!');
        }

        // 真正 push 时再读文件
        const contents = fs.readFileSync(dep);

        return upload(uploadAPI, path, to, contents, onProcess)
            .then(() => done())
            .catch(error => {
                if (error.errno > 100000) {
                    debug('upload error, authenticating...');
                    return authenticate(error).then(() => push(path, to, dep, done, availableRetry));
                }
                else if (availableRetry > 0) {
                    debug('upload error, waiting to retry...');
                    return wait(100).then(push(path, to, dep, done, availableRetry - 1));
                }
                debug('upload error, terminating...');
                done(error);
                throw error;
            });
    }

    function normalize(options: PushOptions): PushOptions {
        if (options.receiver) {
            options.uploadAPI = options.receiver + '/v1/upload';
            options.authAPI = options.receiver + '/v1/authorize';
            options.validateAPI = options.receiver + '/v1/validate';
        }
        options.retry = options.retry || 3;
        options.parallelPushCount = options.parallelPushCount || 100;
        return options;
    }
}
