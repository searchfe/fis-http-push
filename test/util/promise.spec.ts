import {singleton} from '../../src/util/promise';

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
});
