import {debug} from '../util/log';

interface Task<T> {
    fn: () => T | Promise<T>
    resolve: (val: T) => void
    reject: (err: Error) => void
}

export class LimitedConcurrent<T> {
    private pending: Task<T>[] = [];
    // 可用并发数
    private m;

    constructor(private limit: number = Infinity) {
        this.m = this.limit;
    }

    setLimit(newLimit: number) {
        this.m += newLimit - this.limit;
        this.limit = newLimit;
    }

    queue(fn: () => T | Promise<T>) {
        return new Promise((resolve, reject) => {
            this.pending.push({fn, resolve, reject});
            this.signal();
        });
    }

    signal() {
        if (!this.pending.length || !this.m) return;
        this.m--;
        const {fn, resolve, reject} = this.pending.shift();
        Promise.resolve().then(() => fn()).then((ret) => {
            debug('limited concurrent resolving');
            resolve(ret);
            this.m++;
            this.signal();
        }, (err) => {
            debug('limited concurrent rejecting', err);
            reject(err);
            this.m++;
            this.signal();
        });
    }
}
