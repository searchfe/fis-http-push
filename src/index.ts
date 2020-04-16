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
    const totalCount = 1;
    const concurrentUpload = concurrent(uploadWithRetry);
    let successCount = 0;
    let failCount = 0;
    try {
        await concurrentUpload(path, to, normalize(options));
        successCount++;
    }
    catch (err) {
        if (options.fastFail) throw err;
        error(err.message);
        failCount++;
    }
    success(`total ${totalCount}, success ${successCount}, fail ${failCount}`);
}

async function uploadWithRetry(path, to, options) {
    try {
        return await upload(options.uploadAPI, path, to);
    }
    catch (err) {
        if (err.errno === 100305) {
            debug('upload error, authenticating...');
            return auth(options, error).then(() => uploadWithRetry(path, to, options));
        }
        // 只在未知错误时重试
        if (!err.errno && options.retry > 0) {
            debug('upload error, waiting to retry...');
            return wait(100).then(uploadWithRetry(path, to, {
                ...options,
                retry: options.retry - 1
            }));
        }
        throw err;
    }
}
