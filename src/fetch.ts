import {parse} from 'url';
import {tryParseJSON} from './json';

export function fetch(url, data, callback) {
    const collect: string[] = [];
    let opt: IOption = {};
    for (const key of Object.keys(data)) {
        collect.push(key + '=' + encodeURIComponent(data[key]));
    }

    const content = collect.join('&');
    opt.method = opt.method || 'POST';
    opt.headers = {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        ...opt.headers
    };
    opt = parseUrl(url, opt);
    const http = opt.protocol === 'https:' ? require('https') : require('http');

    const req = http.request(opt, res => {
        const status = res.statusCode;
        let body = '';
        res
            .on('data', chunk => (body += chunk))
            .on('end', () => {
                if ((status < 200 || status >= 300) && status !== 304) {
                    callback(status);
                    return;
                }
                const json = tryParseJSON<IStatus>(body);

                if (!json || json.errno) {
                    callback(json || 'The response is not valid json string.');
                }
                else {
                    callback(null, json);
                }
            })
            .on('error', err => callback(err.message || err));
    });
    req.write(content);
    req.end();
}

interface IStatus {
    errno: number;
}
interface IOption {
    agent?: string;
    method?: string;
    host?: string;
    hostname?: string;
    port?: number;
    headers?: {
        'Content-Type': string;
    };
    protocol?: string;
    path?: string;
}

export function parseUrl(url, opt: IOption) {
    opt = opt || {};
    /* eslint-disable-next-line */
    url = parse(url);
    const ssl = url.protocol === 'https:';
    opt.host = opt.host || opt.hostname || ((ssl || url.protocol === 'http:') ? url.hostname : 'localhost');
    opt.port = opt.port || (url.port || (ssl ? 443 : 80));
    opt.path = opt.path || (url.pathname + (url.search ? url.search : ''));
    opt.method = opt.method || 'GET';
    opt.agent = opt.agent || undefined;
    return opt;
}
