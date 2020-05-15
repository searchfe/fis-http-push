import {resolve, basename} from 'path';
import {fcp} from '../index';
import {LogLevel, raw} from '../util/log';

export async function main(argv: string[]) {
    const [, bin, ...args] = argv;
    const name = basename(bin);

    const argMap = {};
    const files = [];
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg[0] === '-') {
            argMap[arg] = true;
            if (
                arg === '--concurrent' || arg === '-c'
                || arg === '--loglevel' || arg === '-l'
            ) {
                argMap[arg] = args[++i];
            }
        }
        else files.push(arg);
    }

    const help = argMap['--help'] || argMap['-h'];
    const version = argMap['--version'] || argMap['-v'];
    const recursive = argMap['--recursive'] || argMap['-r'];
    const debug = argMap['--debug'] || argMap['-d'];
    const quiet = argMap['--quiet'] || argMap['-q'];
    const concurrent = argMap['--concurrent'] || argMap['-c'];
    const logLevel = argMap['--loglevel'] || argMap['-l'];
    if (help) return raw(helpMessage(name));
    if (version) return raw(require(resolve(__dirname, '../../package.json')).version);
    if (files.length < 2) {
        throw new Error(`${name} missing file operand, usage:\n\n${helpMessage(name)}`);
    }
    const options = {};
    const target = files.pop();
    const url = new URL(target);
    options['receiver'] = url.origin;
    if (debug) options['logLevel'] = LogLevel.DEBUG;
    if (quiet) options['logLevel'] = LogLevel.NONE;
    if (logLevel) options['logLevel'] = +logLevel;
    if (recursive) options['recursive'] = true;
    if (concurrent) options['concurrent'] = +concurrent;
    return fcp(files, url.pathname, options);
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
  --concurrent, -c max concurrent http request  [number]
  --loglevel, -l   0,1,2,3,4,5,6                [number]
  --quiet, -q      print nothing, equiv -l 6    [boolean]
  --debug, -d      debug mode, equiv -l 0       [boolean]

Examples:
  fcp ./a.txt http://example.com:8210/tmp/a.txt  a.txt -> /tmp/a.txt
  fcp -r ./dir http://example.com:8210/tmp/dir   dir -> /tmp/dir
  fcp -r ./dir http://example.com:8210/tmp/dir/  dir -> /tmp/dir/dir
  fcp a.txt b.txt http://example.com:8210/tmp/   {a,b}.txt -> /tmp/{a,b}.txt`;
}
