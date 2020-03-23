import {readFileSync} from 'fs';
import {upload} from './upload';
import {requireEmail, parallelFactory, wait} from './util';

export function pushFactory(options) {
    const {
        uploadAPI,
        authAPI, validateAPI,
        retry, parallelPushCount,
        onEnd,
        onProcess
    } = normalize(options);

    return parallelFactory(push, parallelPushCount, onEnd || ((totalCount, successCount, failCount) => {
        // eslint-disable-next-line
        console.log(`deploy compeleted: total ${totalCount}, success ${successCount}, fail ${failCount}`);
    }));

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

                // 出错就退出
                setTimeout(() => {
                    throw new Error(error.errmsg || error);
                }, 0);
            });
    }

    function normalize(options) {
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
