#!/usr/bin/env node

import {resolve} from 'path';
import * as yargs from 'yargs';
import {push} from '../index';
import {parseTargetUrl} from '../util/target';

type OptionValue = string | undefined;

yargs
    .usage('$0 <SOURCE> <TARGET>')
    .check(argv => {
        if (argv._.length !== 2) {
            throw new Error('source and target files must be specified');
        }
        return true;
    });

const source = resolve(yargs.argv._[0]);
const {receiver, path} = parseTargetUrl(yargs.argv._[1]);
push(source, path, {receiver});
