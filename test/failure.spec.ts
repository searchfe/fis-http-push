import mock from 'mock-fs';
import {push} from '../src';
import {clear, FHP_TOKEN_FILE} from '../src/token';
import {startServer, receiver} from './stub/server';
import {TOKEN_FILE_CONTENT} from './stub/token';

describe('各种失败场景', () => {
    const opts = {receiver, fastFail: true};
    beforeEach(() => {
        clear();
        startServer();
        mock.restore();
    });
    afterEach(() => mock.restore());

    it('本地文件不存在', () => {
        mock({
            [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT
        });
        return expect(push('foo.txt', '/tmp/foo.txt', opts)).rejects.toHaveProperty('message', 'Upload file "foo.txt" to "http://localhost:1080/tmp/foo.txt" failed: "ENOENT, no such file or directory \'foo.txt\'"');
    });

    it('远程目录不在白名单', async () => {
        mock({
            '/bar.txt': 'FOO',
            [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT
        });
        await expect(push('/bar.txt', '/bar', opts)).rejects.toHaveProperty('message', 'Upload file "/bar.txt" to "http://localhost:1080/bar" failed: "100503 未授权的文件部署路径，请加入配置白名单中"');
    });

    it('其他错误', () => {
        mock({
            '/bar.txt': 'FOO',
            [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT
        });
        return expect(push('/bar.txt', '/unkown-error', opts)).rejects.toHaveProperty('message', 'Upload file "/bar.txt" to "http://localhost:1080/unkown-error" failed: "500 UNKOWN"');
    });
});
