import debugFactory from 'debug';
import {Upload} from './upload';
import {Options} from './options';
import {success, error} from './util/log';

const debug = debugFactory('fhp');

interface Task {
    // local file
    path: string
    // remote file
    to: string
}

export async function push(path: string, to: string, options: Options) {
    return pushMultiple([{path, to}], options);
}

export async function pushMultiple(tasks: Task[], options: Options) {
    const push = new Upload(options);
    let successCount = 0;
    let failCount = 0;

    const pending = tasks.map(
        ({path, to}) => push.queue(path, to)
            .then(() => {
                successCount++;
                success(path, '>>', to);
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
