#!/usr/bin/env node

import * as yargs from 'yargs';
import {cp} from '../index';

type OptionValue = string | undefined;

const argv = yargs
    .command('$0', 'fcp <SOURCE..> <TARGET>', (yargs) => {
        yargs
            .positional('SOURCE..', {
                describe: 'source file or directory',
                type: 'string'
            })
            .positional('TARGET', {
                describe: 'target file or directory',
                type: 'string'
            })
            .option('recursive', {
                describe: 'push directories recursively',
                type: 'boolean'
            })
            .alias('recursive', 'r')
            .array('SOURCE..')
            .example('$0 ./a.txt http://example.com:8210/tmp/a.txt', 'a.txt -> /tmp/a.txt')
            .example('$0 -r ./dir http://example.com:8210/tmp/dir', 'dir -> /tmp/dir')
            .example('$0 -r ./dir http://example.com:8210/tmp/dir/', 'dir -> /tmp/dir/dir')
            .example('$0 a.txt b.txt http://example.com:8210/tmp/', '{a,b}.txt -> /tmp/{a,b}.txt');
    })
    .wrap(null)
    .check(argv => {
        if (argv._.length < 2) {
            throw new Error('source and target files must be specified');
        }
        return true;
    })
    .argv;

const destUrl = argv._.pop();
const recursive = argv.recursive as boolean;

const url = new URL(destUrl);
cp(argv._, url.pathname, {receiver: url.origin, recursive});
