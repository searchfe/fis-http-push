import {homedir} from 'os';
import {tryParseJSON} from './util/json';
import {exists, readFile, writeFile} from './util/fs';

const HOME = homedir();
export const FIS_TOKEN_FILE = `${HOME}/.fis3-tmp/deploy.json`;
export const FHP_TOKEN_FILE = `${HOME}/.fis-http-push.json`;

let token: IToken;

export async function getToken(): Promise<IToken> {
    if (token) {
        return token;
    }
    const TOKEN_PATH = await tokenPath();
    try {
        const content = await readFile(TOKEN_PATH, 'utf8');
        token = tryParseJSON<IToken>(content);
    }
    catch (err) {
        if (err.code === 'ENOENT') token = {};
        else throw err;
    }
    return token;
}

export async function writeToken(options) {
    await writeFile(await tokenPath(), JSON.stringify(options, null, 2));
    token = options;
}

async function tokenPath() {
    // 如果 FIS3 已经有可用 TOKEN，就先用它
    return (await exists(FIS_TOKEN_FILE)) ? FIS_TOKEN_FILE : FHP_TOKEN_FILE;
}

export interface IToken {
    email?: string;
    code?: string;
    token?: string;
}

export function clear() {
    token = null;
}
