import {FullOptions, Options, normalize} from './options';
import {LimitedConcurrent} from './util/limited-concurrent';
import {upload} from './upload';
import {singleton, wait} from './util/promise';
import {authenticate} from './util';
import {debug} from './util/log';

const auth = singleton(authenticate);

export class Push extends LimitedConcurrent<undefined, [string, string, number?]> {
    private options: FullOptions

    constructor(raw: Options) {
        super(raw.concurrentLimit);
        this.options = normalize(raw);
    }

    getFunction() {
        return this.uploadWithRetry.bind(this);
    }

    async uploadWithRetry(path: string, to: string, retry: number = this.options.retry) {
        debug('uploadWithRetry:', retry);
        try {
            await upload(this.options.uploadAPI, path, to);
            debug('Push resolving');
            return;
        }
        catch (err) {
            if (err.errno === 100305) {
                debug('upload error, authenticating...');
                return auth(this.options, err).then(() => this.uploadWithRetry(path, to, retry));
            }
            // 只在未知错误时重试
            if (!err.errno && retry > 0) {
                debug('upload error, waiting to retry...');
                return wait(100).then(() => this.uploadWithRetry(path, to, retry - 1));
            }
            debug('Push throwing', err);
            throw err;
        }
    }
}
