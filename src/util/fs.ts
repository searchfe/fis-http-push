import fs from 'fs';
import {join} from 'path';
import {promisify} from 'util';
import {debug} from '../util/log';

export const readFile = promisify(fs.readFile);
export const writeFile = promisify(fs.writeFile);
export const exists = file => promisify(fs.stat)(file)
    .catch(e => {
        if (e.code === 'ENOENT') return false;
        throw e;
    });
export const stat = promisify(fs.stat);
export const readdir = promisify(fs.readdir);

export async function listFilesRecursively(dirPath, files: string[] = []) {
    for (const file of await readdir(dirPath)) {
        const fileStat = await stat(dirPath + '/' + file);
        if (fileStat.isDirectory()) await listFilesRecursively(dirPath + '/' + file, files);
        else files.push(join(dirPath, '/', file));
    }
    return files;
}
