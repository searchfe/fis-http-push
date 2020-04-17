import {LimitedConcurrent} from '../../src/util/limited-concurrent';


describe('LimitedConcurrent', () => {
    it('只有一个成功的 Promise', async () => {
        class Concurrent extends LimitedConcurrent<string, []> {
            getFunction() {
                return () => Promise.resolve('FOO');
            }
        }
        const ret = await new Concurrent().queue();
        expect(ret).toEqual('FOO');
    });
    it('只有一个失败的 Promise', async () => {
        expect.assertions(1);
        class Concurrent extends LimitedConcurrent<string, []> {
            getFunction() {
                return () => Promise.reject(new Error('FOO'));
            }
        }
        const ret = new Concurrent().queue();
        return expect(ret).rejects.toHaveProperty('message', 'FOO');
    });
    it('并发的三个 Promise，其中一个失败', async () => {
        class Concurrent extends LimitedConcurrent<number, [number]> {
            getFunction() {
                return r => (r ? Promise.resolve(r) : Promise.reject(new Error('0')));
            }
        }
        const concurrent = new Concurrent();
        const p1 = concurrent.queue(1);
        const p2 = concurrent.queue(2);
        const p3 = concurrent.queue(0);
        await expect(p1).resolves.toEqual(1);
        await expect(p2).resolves.toEqual(2);
        await expect(p3).rejects.toHaveProperty('message', '0');
    });
    it('支持 limit', async () => {
        class Concurrent extends LimitedConcurrent<number, [number]> {
            curr = 0
            max = 0
            getFunction() {
                return r => new Promise<number>((resolve, reject) => {
                    this.curr++;
                    this.max = Math.max(this.max, this.curr);
                    setTimeout(() => {
                        this.curr--;
                        r ? resolve(r) : reject(new Error('0'));
                    });
                });
            }
        }
        const concurrent = new Concurrent(2);
        const p1 = concurrent.queue(1);
        concurrent.queue(2);
        concurrent.queue(3);
        const p4 = concurrent.queue(0);
        const p5 = concurrent.queue(5);
        await expect(p1).resolves.toEqual(1);
        await expect(p4).rejects.toHaveProperty('message', '0');
        await expect(p5).resolves.toEqual(5);
        expect(concurrent.max).toEqual(2);
    });
});
