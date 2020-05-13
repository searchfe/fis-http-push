import {warn, OutStream, doLog, setLogLevel, getLogLevel} from '../../src/util/log';

describe('.setLogLevel()', () => {
    it('设置日志级别可以生效', async () => {
        setLogLevel(3);
        expect(getLogLevel()).toEqual(3);
    });
});

describe('doLog()', () => {
    it('格式化日志', () => {
        const args = doLog(OutStream.STDOUT, 6, 'none', 'foo');
        expect(args).toHaveLength(2);
        expect(args[0]).toMatch(/^\[\d\d-\d\d \d\d:\d\d:\d\d\]$/);
        expect(args[1]).toEqual('foo');
    });
    it('绿色的日志', () => {
        const args = doLog(OutStream.STDOUT, 6, 'green', 'foo');
        expect(args).toHaveLength(2);
        expect(args[0]).toContain('\u001b[32m');
        expect(args[0]).toContain('\u001b[39m');
        expect(args[1]).toEqual('foo');
    });
});

describe('.warn()', () => {
    it('黄色的日志', async () => {
        const args = warn('foo');
        expect(args).toHaveLength(2);
        expect(args[0]).toContain('\u001b[33m');
        expect(args[0]).toContain('\u001b[39m');
        expect(args[1]).toEqual('foo');
    });
});
