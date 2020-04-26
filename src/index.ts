import debugFactory from 'debug';
import chalk from 'chalk';
import {Push} from './push';
import {Options} from './options';
import {success, error} from './util/log';

const debug = debugFactory('fhp');

export async function push(path: string, to: string, options: Options) {
    const push = new Push(options);
    const tasks = [{path, to}];
    let successCount = 0;
    let failCount = 0;

    const pending = tasks.map(
        ({path, to}) => push.queue(path, to)
            .then(() => {
                successCount++;
                success(path, chalk.yellow('>>'), to);
            })
            .catch((err: Error) => {
                failCount++;
                err.message = `Upload file "${path}" to "${options.receiver}${to}" failed: "${err.message}"`;
                if (options.fastFail) throw err;
                error(err.message);
            })
    );

    await Promise.all(pending);
    success(`total ${pending.length}, success ${successCount}, fail ${failCount}`);
}
