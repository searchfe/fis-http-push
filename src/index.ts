import {readFileSync} from 'fs';
import chalk from 'chalk';
import {upload} from './upload';
import {requireEmail, parallelFactory, wait} from './util';

type OnEnd = (totalCount: number, successCount: number, failCount: number) => void
type OnProcess = (options: { path: string, to: string }) => void
const defaultOnEnd = (totalCount, successCount, failCount) => {
    // eslint-disable-next-line
    console.log(chalk.green('compelete'), `total ${totalCount}, success ${successCount}, fail ${failCount}`);
};

interface PushOptions {
    receiver: string;
    retry?: number;
    parallelPushCount?: number;
    uploadAPI?: string;
    authAPI?: string;
    validateAPI?: string;
    onEnd?: OnEnd
    onProcess?: OnProcess
}

// 新接口，先包装旧接口实现
export function push(path: string, to: string, options: PushOptions) {
    const push = pushFactory(options);
    return new Promise((resolve, reject) => {
        push(path, to, path, (err, ret) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(ret);
            }
        });
    });
}

// 给 makit-plugin 用，旧接口，逐步改造掉
export function pushFactory(options: PushOptions) {
    const {
        uploadAPI,
        authAPI, validateAPI,
        retry, parallelPushCount,
        onEnd,
        onProcess
    } = normalize(options);

    return parallelFactory(push, parallelPushCount, onEnd || defaultOnEnd);

    function requireToken(error) {
        return new Promise((resolve, reject) => {
            requireEmail(authAPI, validateAPI, error, err => {
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
        const contents = readFileSync(dep);

        return upload(uploadAPI, path, to, contents, onProcess)
            .catch(error => {
                if (error.errno > 100000) {
                    return requireToken(error).then(() => push(path, to, dep, done, availableRetry));
                }
                else if (availableRetry > 0) {
                    return wait(100).then(push(path, to, dep, done, availableRetry - 1));
                }
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
