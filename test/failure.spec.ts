import mock from 'mock-fs';
import {push} from '../src';
import {clear, FHP_TOKEN_FILE} from '../src/token';
import {startServer, receiver, serverFileSystem} from './stub/server';
import {TOKEN_FILE_CONTENT} from './stub/token';

describe('各种失败场景', () => {
    beforeEach(() => {
        clear();
        startServer();
    });
    afterEach(() => mock.restore());

    it('本地文件不存在', async () => {
        mock({[FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT});
        expect.assertions(1);
        return expect(push('foo.txt', '/tmp/foo.txt', {receiver})).rejects.toHaveProperty('message', 'ENOENT: no such file or directory, open \'foo.txt\'');
    });

    it.skip('远程目录不在白名单', async () => {
        mock({'foo.txt': 'FOO', [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT});
        expect.assertions(1);
        return expect(push('foo.txt', '/foo.txt', {receiver})).rejects.toHaveProperty('message', '未授权的文件部署路径，请加入配置白名单中');
    });
});
