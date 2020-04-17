import {debug} from '../util/log';

export abstract class LimitedConcurrent<T, A extends any[]> {
    private pending: [A, (val: T) => void, (err: Error) => void][] = [];

    constructor(public limit = Infinity) {}

    abstract getFunction(): (...args: any[]) => Promise<T>;

    queue(...args: A) {
        return new Promise((resolve, reject) => {
            this.pending.push([args, resolve, reject]);
            this.signal();
        });
    }

    signal() {
        if (!this.pending.length || !this.limit) return;
        this.limit--;
        const [args, resolve, reject] = this.pending.shift();
        Promise.resolve().then(() => this.getFunction()(...args)).then((ret) => {
            debug('limited concurrent resolving');
            resolve(ret);
            this.limit++;
            this.signal();
        }, (err) => {
            debug('limited concurrent rejecting', err);
            reject(err);
            this.limit++;
            this.signal();
        });
    }
}
