import fs from 'fs';
import {homedir} from 'os';
import {tryParseJSON} from './json';

const HOME = homedir();
const FIS_TOKEN_FILE = `${HOME}/.fis3-tmp/deploy.json`;
// 优先使用 FIS3 TOKEN 路径，使用另外的 TOKEN 路径会导致频繁验证
const TOKEN_PATH = fs.existsSync(FIS_TOKEN_FILE) ? FIS_TOKEN_FILE : `${HOME}/.fis-http-push.json`;

let token: IToken;

export function getToken(): IToken {
    if (token) {
        return token;
    }
    token = (fs.existsSync(TOKEN_PATH) && tryParseJSON<IToken>(fs.readFileSync(TOKEN_PATH).toString())) || {};
    return token;
}

export function writeToken(options) {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(options, null, 2));
    token = options;
}

export interface IToken {
    email?: string;
    code?: string;
    token?: string;
}
