import fs from 'fs';
import debugFactory from 'debug';
import {Options, FullOptions} from './options';
import {upload} from './upload';
import {requireEmail, parallelFactory, wait} from './util';
import {fromCallback} from './util/promise';
import {success} from './util/log';

const defaultOnEnd = (totalCount, successCount, failCount) => {
    success(`total ${totalCount}, success ${successCount}, fail ${failCount}`);
};
const debug = debugFactory('fhp');

export function push(path: string, to: string, options: Options) {
    const push = pushFactory(options);
    return fromCallback(cb => push(path, to, path, cb));
}

export function pushFactory(raw: Options) {
    const options = normalize(raw);
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

    function normalize(options: Options): FullOptions {
        if (!options.receiver) throw new Error('options.receiver is required!');
        return {
            ...options,
            uploadAPI: options.receiver + '/v1/upload',
            authAPI: options.receiver + '/v1/authorize',
            validateAPI: options.receiver + '/v1/validate',
            retry: options.retry || 3,
            parallelPushCount: options.parallelPushCount || 100
        };
    }
}
