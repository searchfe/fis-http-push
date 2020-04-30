#!/usr/bin/env node

import {resolve, basename} from 'path';
import {fcp} from '../index';
import {error} from '../util/log';

main();

function main() {
    const [, bin, ...args] = process.argv;
    const name = basename(bin);

    const argMap = {};
    const files = [];
    for (const arg of args) {
        if (arg[0] === '-') argMap[arg] = true;
        else files.push(arg);
    }

    const help = argMap['--help'] || argMap['-h'];
    // eslint-disable-next-line
    if (help) return console.log(helpMessage(name));

    const version = argMap['--version'] || argMap['-v'];
    // eslint-disable-next-line
    if (version) return console.log(require(resolve(__dirname, '../../package.json')).version);

    if (files.length < 2) {
        error(`${name} missing file operand`);
        // eslint-disable-next-line
        console.log(helpMessage(name));
        process.exit(1);
    }
    const target = files.pop();

    const recursive = argMap['--recursive'] || argMap['-r'];
    const url = new URL(target);
    fcp(files, url.pathname, {receiver: url.origin, recursive});
}

function helpMessage(name: string) {
    return `${name} <SOURCE..> <TARGET>

Positionals:
  SOURCE..  source file or directory            [array]
  TARGET    target file or directory            [string]

Options:
  --version        Show version number          [boolean]
  --help           Show usage instructions.     [boolean]
  --recursive, -r  push directories recursively [boolean]

Examples:
  fcp.js ./a.txt http://example.com:8210/tmp/a.txt  a.txt -> /tmp/a.txt
  fcp.js -r ./dir http://example.com:8210/tmp/dir   dir -> /tmp/dir
  fcp.js -r ./dir http://example.com:8210/tmp/dir/  dir -> /tmp/dir/dir
  fcp.js a.txt b.txt http://example.com:8210/tmp/   {a,b}.txt -> /tmp/{a,b}.txt`;
}
