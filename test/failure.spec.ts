import mock from 'mock-fs';
import {push, pushFile} from '../src';
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
        return expect(pushFile('foo.txt', '/tmp/foo.txt', opts)).rejects.toHaveProperty('message', 'Upload file "foo.txt" to "http://localhost:1080/tmp/foo.txt" failed: "ENOENT, no such file or directory \'foo.txt\'"');
    });

    it('远程目录不在白名单', async () => {
        mock({
            '/bar.txt': 'FOO',
            [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT
        });
        await expect(pushFile('/bar.txt', '/bar', opts)).rejects.toHaveProperty('message', 'Upload file "/bar.txt" to "http://localhost:1080/bar" failed: "100503 未授权的文件部署路径，请加入配置白名单中"');
    });

    it('输入邮箱发生异常', async () => {
        mock({
            '/bar.txt': 'FOO'
        });
        const options = {
            ...opts,
            readEmail: () => {
                throw new Error('intended');
            }
        };
        await expect(pushFile('/bar.txt', '/bar', options)).rejects.toHaveProperty('message', 'Upload file "/bar.txt" to "http://localhost:1080/bar" failed: "intended"');
    });

    it('未知错误', () => {
        mock({
            '/bar.txt': 'FOO',
            [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT
        });
        return expect(pushFile('/bar.txt', '/unkown-error', opts)).rejects.toHaveProperty('message', 'Upload file "/bar.txt" to "http://localhost:1080/unkown-error" failed: "500 UNKOWN"');
    });

    it('并发情况下的错误', () => {
        mock({
            '/foo.txt': 'FOO',
            '/bar.txt': 'BAR',
            [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT
        });
        const tasks = [
            {source: '/foo.txt', dest: '/unkown-error'},
            {source: '/bar.txt', dest: '/unkown-error'}
        ];
        return expect(push(tasks, opts)).rejects.toHaveProperty('message', 'Upload file "/foo.txt" to "http://localhost:1080/unkown-error" failed: "500 UNKOWN"');
    });

    it('并发情况下的输入异常', async () => {
        mock({
            '/foo.txt': 'FOO',
            '/bar.txt': 'BAR'
        });
        const options = {
            ...opts,
            readEmail: () => {
                throw new Error('intended');
            }
        };
        const tasks = [
            {source: '/foo.txt', dest: '/unkown-error'},
            {source: '/bar.txt', dest: '/unkown-error'}
        ];
        await expect(push(tasks, options)).rejects.toHaveProperty('message', 'Upload file "/foo.txt" to "http://localhost:1080/unkown-error" failed: "intended"');
    });
});
