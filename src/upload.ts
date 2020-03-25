import chalk from 'chalk';
import {success} from './log';
import {parseUrl} from './fetch';
import {getToken} from './token';
import {tryParseJSON} from './json';

export function upload(receiver, path, to, contents, onProcess?: (options: {path: string, to: string}) => void) {
    return new Promise((resolve, reject) => {
        const data = {...getToken(), to};
        fupload(receiver, null, data, contents, path, (err, res) => {
            res = res && res.trim();
            const json = tryParseJSON<{errno: number}>(res);

            if (!err && json && json.errno) {
                reject(json);
            }
            else if (err || (!json && res !== '0')) {
                const info = 'upload file [' + path + '] to [' + to + '] by receiver [' + receiver + '] error [' + (err || res) + ']';
                reject(info);
            }
            else {
                if (onProcess) {
                    onProcess({path, to});
                }
                else {
                    // TODO print only when verbose is on
                    success(path, chalk.yellow('>>'), to);
                }
                resolve();
            }
        });
    });
}

/**
 * 遵从RFC规范的文件上传功能实现
 * @param  url      上传的url
 * @param  opt      配置
 * @param  data     要上传的formdata，可传null
 * @param  content  上传文件的内容
 * @param  filename 上传文件的文件名
 * @param  callback 上传后的回调
 */
function fupload(url: string, opt: {[index: string]: any}, data: {[index: string]: string | undefined}, content: string | Buffer, filename: string, callback: Function) {
    if (typeof content === 'string') {
        content = Buffer.from(content, 'utf8');
    }
    else if (!(content instanceof Buffer)) {
        console.error('unable to upload content [%s]', (typeof content)); // eslint-disable-line
    }
    opt = opt || {};
    data = data || {};
    const endl = '\r\n';
    const boundary = '-----np' + Math.random();
    const collect: (string | Buffer)[] = [];
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const value = data[key];
            collect.push('--' + boundary + endl);
            collect.push('Content-Disposition: form-data; name="' + key + '"' + endl);
            collect.push(endl);
            collect.push(value + endl);
        }
    }
    collect.push('--' + boundary + endl);
    collect.push('Content-Disposition: form-data; name="' + (opt.uploadField || 'file') + '"; filename="'
    + filename + '"' + endl);
    collect.push(endl);
    collect.push(content);
    collect.push(endl);
    collect.push('--' + boundary + '--' + endl);

    let length = 0;
    collect.forEach(ele => {
        if (typeof ele === 'string') {
            length += Buffer.from(ele).length;
        }
        else {
            length += ele.length;
        }
    });

    opt.method = opt.method || 'POST';
    opt.headers = {
        'Content-Length': length,
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        ...opt.headers
    };

    opt = parseUrl(url, opt);
    const {request} = opt.protocol === 'https:' ? require('https') : require('http');
    const req = request(opt, res => {
        const status = res.statusCode;
        let body = '';
        res
            .on('data', chunk => (body += chunk))
            .on('end', () => ((status >= 200 && status < 300) || status === 304 ? callback(null, body) : callback(status)))
            .on('error', err => callback(err.message || err));
    });
    req.on('error', err => callback(err.message || err));
    collect.forEach(d => req.write(d));
    req.end();
}
