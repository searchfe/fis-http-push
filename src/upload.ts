import debugFactory from 'debug';
import {getToken} from './token';
import {NormalizedOptions} from './options';
import {LimitedConcurrent} from './util/limited-concurrent';
import {postFormEncoded} from './util/request';
import {singleton, wait} from './util/promise';
import {readFile} from './util/fs';
import {authenticate} from './authenticate';
import {debug} from './util/log';

const auth = singleton(authenticate);
const endl = '\r\n';
// 每个 receiver 域名一个并发限制
const concurrentPool = new Map();

export class Upload {
    private concurrent: LimitedConcurrent<never>

    constructor(private options: NormalizedOptions) {
        this.concurrent = this.createConcurrentInstance();
    }

    private createConcurrentInstance() {
        const {receiver, concurrent} = this.options;
        if (!concurrentPool.has(receiver)) {
            concurrentPool.set(receiver, new LimitedConcurrent<never>(concurrent));
        }
        const instance = concurrentPool.get(receiver);
        instance.setLimit(concurrent);
        return instance;
    }

    async upload(source: string, dest: string) {
        return this.concurrent.queue(() => this.uploadFileWithRetry(source, dest));
    }

    private async uploadFileWithRetry(src: string, target: string, retry: number = this.options.retry) {
        debug('uploadWithRetry:', retry);
        try {
            return await this.uploadFile(src, target);
        }
        catch (err) {
            debug('upload error', err);
            // 100305: token 失效，100302：token 为空
            if (err.errno === 100305 || err.errno === 100302) {
                const token = await getToken();
                if (token.email) debug('Token is invalid: ' + err.message + '\n');
                else debug('Authentication required');
                return auth(this.options).then(() => this.uploadFileWithRetry(src, target, retry));
            }
            // 明确的错误，则直接退出。只重试未知错误。
            if (err.errno || retry <= 0) throw err;
            debug('upload error, waiting to retry...');
            return wait(100).then(() => this.uploadFileWithRetry(src, target, retry - 1));
        }
    }

    private async uploadFile(path, to) {
        const fileContent = await readFile(path);
        const data = {...await getToken(), to};
        const boundary = '-----np' + Math.random();
        const collect: (string | Buffer)[] = [];
        for (const [key, value] of Object.entries(data)) {
            collect.push('--' + boundary + endl);
            collect.push(`Content-Disposition: form-data; name="${key}"`);
            collect.push(endl + endl + value + endl);
        }
        collect.push('--' + boundary + endl);
        collect.push(`Content-Disposition: form-data; name="file"; filename="${path}"`);
        collect.push(endl + endl);
        collect.push(fileContent);
        collect.push(endl);
        collect.push('--' + boundary + '--' + endl);
        return postFormEncoded(this.options.uploadAPI, boundary, collect);
    }
}
