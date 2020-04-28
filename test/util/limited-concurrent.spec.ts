import {LimitedConcurrent} from '../../src/util/limited-concurrent';


describe('LimitedConcurrent', () => {
    it('只有一个成功的 Promise', async () => {
        const ret = await new LimitedConcurrent().queue(() => Promise.resolve('FOO'));
        expect(ret).toEqual('FOO');
    });
    it('只有一个失败的 Promise', async () => {
        expect.assertions(1);
        const ret = new LimitedConcurrent().queue(() => Promise.reject(new Error('FOO')));
        return expect(ret).rejects.toHaveProperty('message', 'FOO');
    });
    it('并发的三个 Promise，其中一个失败', async () => {
        const concurrent = new LimitedConcurrent();
        const p1 = concurrent.queue(() => Promise.resolve(1));
        const p2 = concurrent.queue(() => Promise.resolve(2));
        const p3 = concurrent.queue(() => Promise.reject(new Error('0')));
        await expect(p1).resolves.toEqual(1);
        await expect(p2).resolves.toEqual(2);
        await expect(p3).rejects.toHaveProperty('message', '0');
    });
    it('支持 limit', async () => {
        let curr = 0;
        let max = 0;
        const fn = r => new Promise<number>((resolve, reject) => {
            curr++;
            max = Math.max(max, curr);
            setTimeout(() => {
                curr--;
                r ? resolve(r) : reject(new Error('0'));
            });
        });
        const concurrent = new LimitedConcurrent(2);
        const p1 = concurrent.queue(() => fn(1));
        concurrent.queue(() => fn(2));
        concurrent.queue(() => fn(3));
        const p4 = concurrent.queue(() => fn(0));
        const p5 = concurrent.queue(() => fn(5));
        await expect(p1).resolves.toEqual(1);
        await expect(p4).rejects.toHaveProperty('message', '0');
        await expect(p5).resolves.toEqual(5);
        expect(max).toEqual(2);
    });
});
