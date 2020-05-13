import fs = require('../../src/util/fs');

let originalReadFile = fs.readFile;
let originalReaddir = fs.readdir;
let originalWriteFile = fs.writeFile;
let originalExists = fs.exists;
let originalStat = fs.stat;

export function mock(files: {[key: string]: string}) {
    fs.readFile = async (file) => {
        if (files[file] !== undefined) return files[file] as any;
        const err = new Error('ENOENT');
        err['code'] = 'ENOENT';
        throw err;
    };
    fs.exists = async (file) => !!files[file];
    fs.writeFile = async (file: string, content) => (files[file] = content);
}
export function restore() {
    fs.readFile = originalReadFile;
    fs.readdir = originalReaddir;
    fs.writeFile = originalWriteFile;
    fs.exists = originalExists;
    fs.stat = originalStat;
}
