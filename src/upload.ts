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
// 每个 receiver 域名下所有任务共享一个队列
const concurrentPool = new Map();
const AUTH_ERR = [100100, 100501, 100101, 100201, 100202, 100302, 100304, 100305];
const RETRY_ERR = [100102, 100307];

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
            debug('upload error', err.message);
            // 对于鉴权错误重新鉴权
            if (AUTH_ERR.includes(err.errno)) {
                return auth(this.options).then(() => this.uploadFileWithRetry(src, target, retry));
            }
            // 对于网络错误重试
            if ((RETRY_ERR.includes(err.errno) || !err.errno) && retry > 0) {
                debug('waiting to retry...');
                return wait(100).then(() => this.uploadFileWithRetry(src, target, retry - 1));
            }
            // 其他情况：非网络非鉴权错误（部署路径非法）、重试次数超限
            throw err;
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
