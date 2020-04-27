import fs from 'fs';
import {homedir} from 'os';
import {tryParseJSON} from './util/json';

const HOME = homedir();
export const FIS_TOKEN_FILE = `${HOME}/.fis3-tmp/deploy.json`;
export const FHP_TOKEN_FILE = `${HOME}/.fis-http-push.json`;

let token: IToken;

export function getToken(): IToken {
    if (token) {
        return token;
    }
    const TOKEN_PATH = tokenPath();
    // TODO async
    token = (fs.existsSync(TOKEN_PATH) && tryParseJSON<IToken>(fs.readFileSync(TOKEN_PATH).toString())) || {};
    return token;
}

export function writeToken(options) {
    fs.writeFileSync(tokenPath(), JSON.stringify(options, null, 2));
    token = options;
}

function tokenPath() {
    // 如果 FIS3 已经有可用 TOKEN，就先用它
    return fs.existsSync(FIS_TOKEN_FILE) ? FIS_TOKEN_FILE : FHP_TOKEN_FILE;
}

export interface IToken {
    email?: string;
    code?: string;
    token?: string;
}

export function clear() {
    token = null;
}
