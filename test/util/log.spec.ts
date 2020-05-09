import {warn, OutStream, defaultLogImpl, setLogLevel, getLogLevel} from '../../src/util/log';

describe('.setLogLevel()', () => {
    it('设置日志级别可以生效', async () => {
        setLogLevel(3);
        expect(getLogLevel()).toEqual(3);
    });
});

describe('defaultLogImpl', () => {
    it('格式化日志', () => {
        const str = defaultLogImpl(OutStream.STDOUT, 6, 'raw', 'foo');
        expect(str).toMatch(/^\[\d\d-\d\d \d\d:\d\d:\d\d\] 'foo'\n$/);
    });
    it('绿色的日志', () => {
        const str = defaultLogImpl(OutStream.STDOUT, 6, 'green', 'foo');
        expect(str).toContain('\u001b[32m');
        expect(str).toContain('\u001b[39m');
        expect(str).toContain('\'foo\'');
    });
});

describe('.warn()', () => {
    it('黄色的日志', async () => {
        const str = warn('foo');
        expect(str).toContain('\u001b[33m');
        expect(str).toContain('\u001b[39m');
        expect(str).toContain('\'foo\'');
    });
});
