import {parseTargetUrl} from '../src/util';

describe('util', () => {
    describe('.parseTargetUrl()', () => {
        it('should parse a normal target', () => {
            const ret = parseTargetUrl('http://example.com:8210/var/www/main.js');
            expect(ret).toHaveProperty('receiver', 'http://example.com:8210');
            expect(ret).toHaveProperty('path', '/var/www/main.js');
        });
        it('should parse a target without port', () => {
            const ret = parseTargetUrl('http://example.com/var/www/main.js');
            expect(ret).toHaveProperty('receiver', 'http://example.com');
            expect(ret).toHaveProperty('path', '/var/www/main.js');
        });
        it('should throw for invalid url', () => {
            expect(() => parseTargetUrl('.com:8210/main.js')).toThrow();
        });
    });
});
