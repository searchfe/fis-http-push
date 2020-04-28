import mock from 'mock-fs';
import {push} from '../src';
import {clear, FHP_TOKEN_FILE} from '../src/token';
import {startServer, receiver} from './stub/server';
import {TOKEN_FILE_CONTENT, EMAIL, CODE} from './stub/token';

describe('邮件验证功能', () => {
    let readEmail;
    let readCode;
    beforeEach(() => {
        clear();
        startServer();
        readEmail = jest.fn(() => Promise.resolve(EMAIL));
        readCode = jest.fn(() => Promise.resolve(CODE));
    });
    afterEach(() => mock.restore());

    it('缓存不存在时提示验证', async () => {
        mock({
            '/foo.txt': 'FOO'
        });
        await push('/foo.txt', '/tmp/foo.txt', {receiver, readEmail, readCode});
        expect(readEmail).toBeCalledTimes(1);
        expect(readCode).toBeCalledTimes(1);
    });

    it('缓存中不存在 email 字段时提示验证', async () => {
        mock({
            '/foo.txt': 'FOO',
            '~/.fis3-tmp/deploy.json': '{}'
        });
        await push('/foo.txt', '/tmp/foo.txt', {receiver, readEmail, readCode});
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
        await push('/foo.txt', '/tmp/foo.txt', {receiver, readEmail, readCode});
        expect(readEmail).toBeCalledTimes(1);
        expect(readCode).toBeCalledTimes(1);
    });

    it('可以使用 fis 缓存里的 token', async () => {
        mock({
            '/foo.txt': 'FOO',
            [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT
        });
        await push('/foo.txt', '/tmp/foo.txt', {receiver, readEmail, readCode});
        expect(readEmail).toBeCalledTimes(0);
        expect(readCode).toBeCalledTimes(0);
    });

    it('可以使用 fhp 缓存里的 token', async () => {
        mock({
            '/foo.txt': 'FOO',
            [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT
        });
        await push('/foo.txt', '/tmp/foo.txt', {receiver, readEmail, readCode});
        expect(readEmail).toBeCalledTimes(0);
        expect(readCode).toBeCalledTimes(0);
    });
});
