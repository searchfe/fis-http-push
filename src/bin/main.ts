import {resolve, basename} from 'path';
import {fcp} from '../index';
import {LogLevel, raw} from '../util/log';

export async function main(argv: string[]) {
    const [, bin, ...args] = argv;
    const name = basename(bin);

    const argMap = {};
    const files = [];
    for (const arg of args) {
        if (arg[0] === '-') argMap[arg] = true;
        else files.push(arg);
    }

    const help = argMap['--help'] || argMap['-h'];
    const version = argMap['--version'] || argMap['-v'];
    const recursive = argMap['--recursive'] || argMap['-r'];
    const debug = argMap['--debug'] || argMap['-d'];
    const quiet = argMap['--quiet'] || argMap['-q'];

    if (help) return raw(helpMessage(name));
    if (version) return raw(require(resolve(__dirname, '../../package.json')).version);
    if (files.length < 2) {
        throw new Error(`${name} missing file operand\n\n${helpMessage(name)}\n`);
    }
    const target = files.pop();

    const url = new URL(target);
    let logLevel = LogLevel.INFO;
    if (debug) logLevel = LogLevel.DEBUG;
    if (quiet) logLevel = LogLevel.NONE;
    return fcp(files, url.pathname, {receiver: url.origin, recursive, logLevel});
}

export function helpMessage(name: string) {
    return `${name} <SOURCE..> <TARGET>

Positionals:
  SOURCE..  source file or directory            [array]
  TARGET    target file or directory            [string]

Options:
  --version        Show version number          [boolean]
  --help           Show usage instructions.     [boolean]
  --recursive, -r  push directories recursively [boolean]
  --quiet, -q      print nothing                [boolean]
  --debug, -d      print debug message          [boolean]

Examples:
  fcp ./a.txt http://example.com:8210/tmp/a.txt  a.txt -> /tmp/a.txt
  fcp -r ./dir http://example.com:8210/tmp/dir   dir -> /tmp/dir
  fcp -r ./dir http://example.com:8210/tmp/dir/  dir -> /tmp/dir/dir
  fcp a.txt b.txt http://example.com:8210/tmp/   {a,b}.txt -> /tmp/{a,b}.txt`;
}
