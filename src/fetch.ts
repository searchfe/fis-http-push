import {tryParseJSON} from './json';

export function fetch(url, data, callback) {
    const collect: string[] = [];
    for (const key of Object.keys(data)) {
        collect.push(key + '=' + encodeURIComponent(data[key]));
    }

    const content = collect.join('&');
    const opt = {
        ...optionsFromUrl(url),
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
    };
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
                const json = tryParseJSON<IResponse>(body);

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

export function request(url, options, data) {
    return new Promise((resolve, reject) => {
        const {request} = options.protocol === 'https:' ? require('https') : require('http');
        const req = request(options, responseHandler);
        req.on('error', reject);
        for (const item of data) req.write(item);
        req.end();

        function responseHandler(res) {
            const status = res.statusCode;
            let body = '';
            res
                .on('data', chunk => (body += chunk))
                .on('end', onEnd)
                .on('error', reject);

            function onEnd() {
                if (status < 200 || status >= 300) {
                    return reject(new Error(`${status} ${body}`));
                }

                if (body === '0') return resolve(body);

                const json = tryParseJSON<{errno: number, errmsg: string}>(body);
                if (!json) return reject(new Error(`Unkown Error: "${body}"`));
                if (!json.errno) resolve(body);

                const msg = `${json.errno} ${json['errmsg'] || 'Unkown Error'}`;
                const err = new Error(msg);
                err['errno'] = json.errno;
                return reject(err);
            }
        }
    });
}

export function optionsFromUrl(raw): IOptions {
    const url = new URL(raw);
    const ssl = url.protocol === 'https:';
    return {
        host: ssl || url.protocol === 'http:' ? url.hostname : 'localhost',
        port: url.port || (ssl ? 443 : 80),
        path: url.pathname + (url.search ? url.search : ''),
        method: 'GET'
    };
}

interface IResponse {
    errno: number;
    errmsg: string;
}
interface IOptions {
    agent?: string;
    method?: string;
    host?: string;
    hostname?: string;
    port?: string | number;
    headers?: {
        'Content-Type': string;
    };
    protocol?: string;
    path?: string;
}
