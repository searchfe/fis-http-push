import fs from 'fs';
import debugFactory from 'debug';
import {getToken} from './token';
import {FullOptions, Options, normalize} from './options';
import {LimitedConcurrent} from './util/limited-concurrent';
import {postFormEncoded} from './util/request';
import {singleton, wait} from './util/promise';
import {authenticate} from './authenticate';
import {debug, log} from './util/log';

const auth = singleton(authenticate);
const endl = '\r\n';

export class Upload extends LimitedConcurrent<undefined, [string, string, number?]> {
    private options: FullOptions

    constructor(raw: Options) {
        super(raw.concurrentLimit);
        this.options = normalize(raw);
    }

    getFunction() {
        return this.uploadWithRetry.bind(this);
    }

    async uploadWithRetry(src: string, target: string, retry: number = this.options.retry) {
        debug('uploadWithRetry:', retry);
        try {
            return await this.uploadFile(src, target);
        }
        catch (err) {
            if (err.errno === 100305) {
                if (getToken().email) log('Token is invalid: ' + err.message + '\n');
                else log('Authentication required');
                return auth(this.options).then(() => this.uploadWithRetry(src, target, retry));
            }
            // 明确的错误，则直接退出。只重试未知错误。
            if (err.errno || retry <= 0) throw err;
            debug('upload error, waiting to retry...');
            return wait(100).then(() => this.uploadWithRetry(src, target, retry - 1));
        }
    }

    async uploadFile(path, to) {
        // TODO async
        const fileContent = fs.readFileSync(path);
        const data = {...getToken(), to};
        const boundary = '-----np' + Math.random();
        const collect: (string | Buffer)[] = [];
        for (const [key, value] of Object.entries(data)) {
            collect.push('--' + boundary + endl);
            collect.push(`Content-Disposition: form-data; name="${key}"`);
            collect.push(endl + endl + value + endl);
        }
        collect.push('--' + boundary + endl);
        collect.push(`Content-Disposition: form-data; name="file"; filename="${path}"`);
        collect.push(endl + endl + fileContent + endl);
        collect.push('--' + boundary + '--' + endl);
        return postFormEncoded(this.options.uploadAPI, boundary, collect);
    }
}
