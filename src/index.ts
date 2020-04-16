import debugFactory from 'debug';
import {Options, normalize} from './options';
import {upload} from './upload';
import {authenticate} from './util';
import {singleton, wait, concurrent} from './util/promise';
import {success, error} from './util/log';

const debug = debugFactory('fhp');
const auth = singleton(authenticate);

export async function push(path: string, to: string, options: Options) {
    process.stdout.write('to' + JSON.stringify(options) + '\n');
    const push = pushFactory(options);
    const totalCount = 1;
    let successCount = 0;
    let failCount = 0;
    try {
        await push(path, to, options);
        successCount++;
    }
    catch (err) {
        if (options.fastFail) throw err;
        error(err.message);
        failCount++;
    }
    success(`total ${totalCount}, success ${successCount}, fail ${failCount}`);
}

export function pushFactory(raw: Options) {
    const options = normalize(raw);

    return concurrent(uploadWithRetry, options.concurrentLimit);

    function uploadWithRetry(path, to, retry = options.retry) {
        return upload(options.uploadAPI, path, to)
            .catch(error => {
                if (error.errno === 100305) {
                    debug('upload error, authenticating...');
                    return auth(options, error).then(() => uploadWithRetry(path, to, retry));
                }
                // 只在未知错误时重试
                else if (!error.errno && retry > 0) {
                    debug('upload error, waiting to retry...');
                    return wait(100).then(uploadWithRetry(path, to, retry - 1));
                }
                debug('upload error, terminating...');
                throw error;
            });
    }
}

