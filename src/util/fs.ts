import {stat, readdir} from 'fs';
import {join} from 'path';
import {promisify} from 'util';
import {debug} from '../util/log';

export async function listFilesRecursively(dirPath, files: string[] = []) {
    for (const file of await promisify(readdir)(dirPath)) {
        const fileStat = await promisify(stat)(dirPath + '/' + file);
        if (fileStat.isDirectory()) await listFilesRecursively(dirPath + '/' + file, files);
        else files.push(join(dirPath, '/', file));
    }
    return files;
}
