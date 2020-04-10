export function fromCallback<T>(fn): Promise<T> {
    return new Promise((resolve, reject) => {
        fn((err: Error, result: T) => (err ? reject(err) : resolve(result)));
    });
}

export function singleton<T>(fn: () => Promise<T>): () => Promise<T> {
    const queue = [];
    return () => new Promise((resolve, reject) => {
        queue.push([resolve, reject]);

        // 后续的都直接返回，由第一个触发
        if (queue.length > 1) return;

        fn().then(ret => {
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
