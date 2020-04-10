export function fromCallback<T>(fn): Promise<T> {
    return new Promise((resolve, reject) => {
        fn((err: Error, result: T) => (err ? reject(err) : resolve(result)));
    });
}
