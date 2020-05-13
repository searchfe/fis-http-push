import fs from 'fs';
import {join} from 'path';
import {promisify} from 'util';
import {debug} from '../util/log';

export let readFile = promisify(fs.readFile);

export let writeFile = promisify(fs.writeFile);

export let stat = promisify(fs.stat);

export let readdir = promisify(fs.readdir);

export let exists = file => stat(file).catch(e => {
    if (e.code === 'ENOENT') return false;
    throw e;
});

export async function listFilesRecursively(dirPath, files: string[] = []) {
    for (const file of await readdir(dirPath)) {
        const fileStat = await stat(dirPath + '/' + file);
        if (fileStat.isDirectory()) await listFilesRecursively(dirPath + '/' + file, files);
        else files.push(join(dirPath, '/', file));
    }
    return files;
}
