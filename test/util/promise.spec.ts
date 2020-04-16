import {singleton, concurrent} from '../../src/util/promise';

describe('Promise', () => {
    describe('.singleton()', () => {
        it('只有一个成功的 Promise', async () => {
            const fn = singleton(() => Promise.resolve('FOO'));
            const ret = await fn();
            expect(ret).toEqual('FOO');
        });
        it('只有一个失败的 Promise', async () => {
            expect.assertions(1);
            const fn = singleton(() => Promise.reject(new Error('FOO')));
            return expect(fn()).rejects.toHaveProperty('message', 'FOO');
        });

        it('并发的三个 Promise，只调用第一个', async () => {
            const resolver: () => Promise<string> = jest.fn(() => Promise.resolve('FOO'));
            const fn = singleton(resolver);
            const ret = await Promise.all([fn(), fn(), fn()]);
            expect(ret).toEqual(['FOO', 'FOO', 'FOO']);
            expect(resolver).toHaveBeenCalledTimes(1);
        });

        it('并发的三个 Promise，只调用第一个，即使第一个失败', async () => {
            expect.assertions(4);
            const resolver: () => Promise<string> = jest.fn(() => Promise.reject(new Error('FOO')));
            const fn = singleton(resolver);
            const p1 = fn();
            const p2 = fn();
            const p3 = fn();
            await expect(p1).rejects.toHaveProperty('message', 'FOO');
            await expect(p2).rejects.toHaveProperty('message', 'FOO');
            await expect(p3).rejects.toHaveProperty('message', 'FOO');
            expect(resolver).toHaveBeenCalledTimes(1);
        });
    });
    describe('.concurrent()', () => {
        it('只有一个成功的 Promise', async () => {
            const fn = concurrent(() => Promise.resolve('FOO'));
            const ret = await fn();
            expect(ret).toEqual('FOO');
        });
        it('只有一个失败的 Promise', async () => {
            expect.assertions(1);
            const fn = concurrent(() => Promise.reject(new Error('FOO')));
            return expect(fn()).rejects.toHaveProperty('message', 'FOO');
        });
        it('并发的三个 Promise，其中一个失败', async () => {
            const resolver = r => (r ? Promise.resolve(r) : Promise.reject(new Error('0')));
            const fn = concurrent(resolver);
            const p1 = fn(1);
            const p2 = fn(2);
            const p3 = fn(0);
            await expect(p1).resolves.toEqual(1);
            await expect(p2).resolves.toEqual(2);
            await expect(p3).rejects.toHaveProperty('message', '0');
        });
        it('支持 limit', async () => {
            let curr = 0;
            let max = 0;
            const resolver = r => new Promise((resolve, reject) => {
                curr++;
                max = Math.max(max, curr);
                setTimeout(() => {
                    curr--;
                    r ? resolve(r) : reject(new Error('0'));
                });
            });
            const fn = concurrent(resolver, 2);
            const p1 = fn(1);
            fn(2);
            fn(3);
            const p4 = fn(0);
            const p5 = fn(5);
            await expect(p1).resolves.toEqual(1);
            await expect(p4).rejects.toHaveProperty('message', '0');
            await expect(p5).resolves.toEqual(5);
            expect(max).toEqual(2);
        });
        it('支持 onProgress', (done) => {
            // 没法测试失败的情况，jest 会在 Promise.reject 时直接失败。
            // 见：https://github.com/facebook/jest/issues/5311
            const resolver = (r) => Promise.resolve(r);
            const onProgress = jest.fn(() => onProgress.mock.calls.length === 5 && assertions());
            const fn = concurrent(resolver, 2, onProgress);
            fn(1);
            fn(2);
            fn(3);
            fn(4);
            fn(5);

            function assertions() {
                expect(onProgress.mock.calls).toEqual([
                    [{
                        failCount: 0,
                        pendingCount: 4,
                        successCount: 1,
                        totalCount: 5
                    }], [{
                        failCount: 0,
                        pendingCount: 3,
                        successCount: 2,
                        totalCount: 5
                    }], [{
                        failCount: 0,
                        pendingCount: 2,
                        successCount: 3,
                        totalCount: 5
                    }], [{
                        failCount: 0,
                        pendingCount: 1,
                        successCount: 4,
                        totalCount: 5
                    }], [{
                        failCount: 0,
                        pendingCount: 0,
                        successCount: 5,
                        totalCount: 5
                    }]
                ]);
                done();
            }
        });
    });
});
