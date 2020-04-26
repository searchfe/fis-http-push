import {tryParseJSON} from './json';

export function postURLEncoded(url, data) {
    const content = Object.keys(data).map(key => `${key}=${encodeURIComponent(data[key])}`).join('&');
    const options = {
        ...optionsFromUrl(url),
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
        }
    };
    return request(options, [content]);
}

export function postFormEncoded(url, boundary, data) {
    const length = data.reduce((prev, item) => prev + Buffer.from(item).length, 0);
    const options = {
        ...optionsFromUrl(url),
        method: 'POST',
        headers: {
            'Content-Length': length,
            'Content-Type': 'multipart/form-data; boundary=' + boundary
        }
    };
    return request(options, data);
}

export function request(options: IOptions, data: (Buffer | string)[]) {
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
                const json = tryParseJSON<{errno: number, errmsg: string}>(body);
                if (!json) return reject(new Error(`Unkown Error: "${body}"`));
                if (!json.errno) resolve(json);

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
