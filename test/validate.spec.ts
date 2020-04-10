import mock from 'mock-fs';
import {push} from '../src';
import {startServer} from './stub/server';

const receiver = 'http://localhost:1080';

describe('Token 验证功能', () => {
    beforeEach(() => {
        startServer();
        mock({
            '/foo.txt': 'FOO',
            '/Users/harttle/.fis3-tmp/deploy.json': '{}'
        });
    });
    afterEach(() => {
        mock.restore();
    });

    it('缓存中不存在 email 时提示验证', async () => {
        const readEmail = jest.fn(() => Promise.resolve('harttle@example.com'));
        const readCode = jest.fn(() => Promise.resolve('MOCK_CODE'));
        await push('/foo.txt', '/tmp/foo.txt', {receiver, readEmail, readCode});
        mock.restore();
        expect(readEmail).toBeCalledTimes(1);
        expect(readCode).toBeCalledTimes(1);
    });
});
