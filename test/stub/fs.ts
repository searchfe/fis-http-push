import fs = require('../../src/util/fs');

let originalReadFile = fs.readFile;
let originalReaddir = fs.readdir;
let originalWriteFile = fs.writeFile;
let originalExists = fs.exists;
let originalStat = fs.stat;

type File = string
interface Directory {
    [key: string]: File | Directory
}

function createFS(files: Directory) {
    const root: Directory = {};
    for (const [k, v] of Object.entries(files)) {
        const val = isDirectory(v) ? createFS(v) : v;
        addFileOrDirectory(root, k, val);
    }
    return root;
}

function getFileOrDirectory(root: Directory, path: string): File | Directory {
    let node: File | Directory = root;
    for (const slug of getPathSlugs(path)) {
        if (node[slug] === undefined) return undefined;
        node = node[slug];
    }
    return node;
}

function getFileOrDirectoryOrThrow(root: Directory, path: string): File | Directory {
    const f = getFileOrDirectory(root, path);
    if (f === undefined) {
        const err = new Error(`ENOENT, no such file or directory '${path}'`);

        err['code'] = 'ENOENT';
        throw err;
    }
    return f;
}

function addFileOrDirectory(root: Directory, path: string, fileOrDirectory: File | Directory) {
    let node: File | Directory = root;
    const parents = getPathSlugs(path);
    const basename = parents.pop();
    for (const slug of parents) {
        node[slug] = node[slug] || {};
        node = node[slug];
    }
    node[basename] = fileOrDirectory;
}

function getPathSlugs(path: string) {
    return path.split('/').filter(x => x && x !== '.');
}

function isDirectory(f: File | Directory): f is Directory {
    return typeof f === 'object';
}

export function mock(files: Directory) {
    const root = createFS(files);
    fs.readFile = async (path) => {
        const f = getFileOrDirectoryOrThrow(root, path);
        if (isDirectory(f)) throw new Error('readFile called on directory');
        return f as any;
    };
    fs.stat = async (path: string) => {
        const f = getFileOrDirectoryOrThrow(root, path);
        return {
            isDirectory: () => isDirectory(f),
            isFile: () => !isDirectory(f)
        } as any;
    };
    fs.readdir = async (path: string) => {
        const f = getFileOrDirectoryOrThrow(root, path);
        if (!isDirectory(f)) throw new Error(`ENOTDIR, not a directory '${path}'`);

        return Object.keys(f) as any;
    };
    fs.exists = async (path) => !!getFileOrDirectory(root, path);
    fs.writeFile = async (file: string, content) => addFileOrDirectory(root, file, content);
}
export function restore() {
    fs.readFile = originalReadFile;
    fs.readdir = originalReaddir;
    fs.writeFile = originalWriteFile;
    fs.exists = originalExists;
    fs.stat = originalStat;
}
