import {push, pushFile} from '../src';
import {clear, FHP_TOKEN_FILE} from '../src/token';
import {startServer, receiver, serverFileSystem} from './stub/server';
import {TOKEN_FILE_CONTENT, EMAIL, CODE} from './stub/token';
import {mock, restore} from './stub/fs';

describe('邮件验证功能', () => {
    const logLevel = 6;
    let readEmail;
    let readCode;
    beforeEach(() => {
        clear();
        startServer();
        readEmail = jest.fn(() => Promise.resolve(EMAIL));
        readCode = jest.fn(() => Promise.resolve(CODE));
    });
    afterEach(restore);

    it('缓存不存在时提示验证', async () => {
        mock({
            '/foo.txt': 'FOO'
        });
        await pushFile('/foo.txt', '/tmp/foo.txt', {receiver, readEmail, readCode, logLevel});
        expect(readEmail).toBeCalledTimes(1);
        expect(readCode).toBeCalledTimes(1);
    });

    it('缓存中不存在 email 字段时提示验证', async () => {
        mock({
            '/foo.txt': 'FOO',
            '~/.fis3-tmp/deploy.json': '{}'
        });
        await pushFile('/foo.txt', '/tmp/foo.txt', {receiver, readEmail, readCode, logLevel});
        expect(readEmail).toBeCalledTimes(1);
        expect(readCode).toBeCalledTimes(1);
    });

    it('缓存中 email 字段过期时提示验证', async () => {
        mock({
            '/foo.txt': 'FOO',
            '~/.fis3-tmp/deploy.json': JSON.stringify({
                email: EMAIL,
                code: CODE,
                token: 'MOCK_TOKEN_EXPIRED'
            })
        });
        await pushFile('/foo.txt', '/tmp/foo.txt', {receiver, readEmail, readCode, logLevel});
        expect(readEmail).toBeCalledTimes(1);
        expect(readCode).toBeCalledTimes(1);
    });

    it('可以使用 fis 缓存里的 token', async () => {
        mock({
            '/foo.txt': 'FOO',
            [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT
        });
        await pushFile('/foo.txt', '/tmp/foo.txt', {receiver, readEmail, readCode, logLevel});
        expect(readEmail).toBeCalledTimes(0);
        expect(readCode).toBeCalledTimes(0);
    });

    it('可以使用 fhp 缓存里的 token', async () => {
        mock({
            '/foo.txt': 'FOO',
            [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT
        });
        await pushFile('/foo.txt', '/tmp/foo.txt', {receiver, readEmail, readCode, logLevel});
        expect(readEmail).toBeCalledTimes(0);
        expect(readCode).toBeCalledTimes(0);
    });

    it('并发时只验证一次 Token', async () => {
        mock({
            '/foo.txt': 'FOO',
            '/bar.txt': 'BAR'
        });
        const tasks = [
            {source: '/foo.txt', dest: '/tmp/foo'},
            {source: '/bar.txt', dest: '/tmp/bar'}
        ];
        readEmail = jest.fn(() => new Promise((resolve) => setTimeout(() => resolve(EMAIL), 100)));
        await push(tasks, {receiver, readEmail, readCode, logLevel});
        expect(readEmail).toBeCalledTimes(1);
        expect(readCode).toBeCalledTimes(1);
        expect(serverFileSystem.get('/tmp/foo')).toEqual('FOO');
        expect(serverFileSystem.get('/tmp/bar')).toEqual('BAR');
    });
});
