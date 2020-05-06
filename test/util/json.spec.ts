import {tryParseJSON} from '../../src/util/json';

describe('.tryParseJSON()', () => {
    it('合法 JSON', async () => {
        return expect(tryParseJSON('{"foo": "bar"}')).toEqual({foo: 'bar'});
    });
    it('单个字符串 JSON', async () => {
        return expect(tryParseJSON('"/foo.txt"')).toEqual('/foo.txt');
    });
    it('不合法 JSON', async () => {
        return expect(tryParseJSON('/foo.txt"')).toEqual(null);
    });
});
