import debugFactory from 'debug';
import {Options, normalize} from './options';
import {upload} from './upload';
import {authenticate, parallelFactory, wait} from './util';
import {fromCallback, singleton} from './util/promise';
import {success} from './util/log';

const defaultOnEnd = (totalCount, successCount, failCount) => {
    success(`total ${totalCount}, success ${successCount}, fail ${failCount}`);
};
const debug = debugFactory('fhp');
const auth = singleton(authenticate);

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

    function push(path, to, dep, done, availableRetry = retry) {
        return upload(uploadAPI, path, to, onProcess)
            .then(() => done())
            .catch(error => {
                if (error.errno > 100000) {
                    debug('upload error, authenticating...');
                    return auth(options, error).then(() => push(path, to, dep, done, availableRetry));
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
}

