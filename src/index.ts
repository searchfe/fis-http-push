import debugFactory from 'debug';
import {Push} from './push';
import {Options} from './options';
import {success, error} from './util/log';

const debug = debugFactory('fhp');

export async function push(path: string, to: string, options: Options) {
    const push = new Push(options);

    const pending = [push.queue(path, to)];
    let successCount = 0;
    let failCount = 0;

    const successHandler = () => {
        debug('push success');
        successCount++;
    };
    const errorHandler = (err: Error) => {
        failCount++;
        debug('push error', err);
        if (options.fastFail) throw err;
        else error(err);
    };
    await Promise.all(pending.map(p => p.then(successHandler).catch(errorHandler)));
    success(`total ${pending.length}, success ${successCount}, fail ${failCount}`);
}
