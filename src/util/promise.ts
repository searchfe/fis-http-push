export function wait(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

export function fromCallback<T>(fn): Promise<T> {
    return new Promise((resolve, reject) => {
        fn((err: Error, result: T) => (err ? reject(err) : resolve(result)));
    });
}

export function singleton<T>(fn: () => Promise<T>): () => Promise<T>;
export function singleton<T, A1>(fn: (...args: [A1]) => Promise<T>): (...args: [A1]) => Promise<T>;
export function singleton<T, A1, A2>(fn: (...args: [A1, A2]) => Promise<T>): (...args: [A1, A2]) => Promise<T>;
export function singleton<T>(fn: (...args: any) => Promise<T>): (...args: any) => Promise<T> {
    const queue = [];
    return (...args) => new Promise((resolve, reject) => {
        queue.push([resolve, reject]);

        // 后续的都直接返回，由第一个触发
        if (queue.length > 1) return;

        fn(...args).then(ret => {
            while (queue.length) {
                const [resolve] = queue.pop();
                resolve(ret);
            }
        }).catch(err => {
            while (queue.length) {
                const [, reject] = queue.pop();
                reject(err);
            }
        });
    });
}

interface ProgressInfo {
    totalCount: number
    successCount: number
    failCount: number
    pendingCount: number
}

export function concurrent(
    fn: (...args: any[]) => Promise<any>,
    limit = Infinity,
    onProgress: (info: ProgressInfo) => void = () => undefined
) {
    const pending: any[][] = [];
    let totalCount = 0;
    let successCount = 0;
    let failCount = 0;

    return function (...args: any[]) {
        totalCount++;
        return new Promise((resolve, reject) => {
            pending.push([args, resolve, reject]);
            exec();
        });
    };

    function exec() {
        if (pending.length && limit > 0) {
            limit--;
            const [args, resolve, reject] = pending.shift();
            Promise.resolve(fn(...args)).then((ret) => {
                resolve(ret);
                successCount++;
                progress();
            }, (err) => {
                reject(err);
                failCount++;
                progress();
            });
        }
    }

    function progress() {
        const pendingCount = totalCount - successCount - failCount;
        onProgress({totalCount, successCount, failCount, pendingCount});
        limit++;
        exec();
    }
}
