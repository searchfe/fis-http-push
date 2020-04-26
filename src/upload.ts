import fs from 'fs';
import debugFactory from 'debug';
import {optionsFromUrl, request} from './fetch';
import {getToken} from './token';

const debug = debugFactory('fhp');
const endl = '\r\n';

export async function upload(path, to, uploadAPI) {
    const fileContent = fs.readFileSync(path);
    const data = {...getToken(), to};
    const boundary = '-----np' + Math.random();
    const collect: (string | Buffer)[] = [];
    for (const [key, value] of Object.entries(data)) {
        collect.push('--' + boundary + endl);
        collect.push('Content-Disposition: form-data; name="' + key + '"' + endl);
        collect.push(endl);
        collect.push(value + endl);
    }
    collect.push('--' + boundary + endl);
    collect.push(`Content-Disposition: form-data; name="file"; filename="${path}"`);
    collect.push(endl);
    collect.push(endl);
    collect.push(fileContent);
    collect.push(endl);
    collect.push('--' + boundary + '--' + endl);

    const length = collect.reduce((prev, item) => prev + Buffer.from(item).length, 0);
    const options = {
        ...optionsFromUrl(uploadAPI),
        method: 'POST',
        headers: {
            'Content-Length': length,
            'Content-Type': 'multipart/form-data; boundary=' + boundary
        }
    };
    return request(uploadAPI, options, collect);
}
