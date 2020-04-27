import mock from 'mock-fs';
import {push, pushMultiple} from '../src';
import {clear, FHP_TOKEN_FILE} from '../src/token';
import {getLogImpl, setLogImpl, restoreLogImpl} from '../src/util/log';
import {startServer, receiver} from './stub/server';
import {TOKEN_FILE_CONTENT} from './stub/token';
import {mockLogImpl} from './stub/log';

describe('日志参数', () => {
    jest.mock('../src/util/log');
    beforeEach(() => {
        clear();
        startServer();
        setLogImpl(mockLogImpl());
    });
    afterEach(() => {
        mock.restore();
        restoreLogImpl();
    });

    it('上传单个文件', async () => {
        mock({'/foo.txt': 'FOO', [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT});
        await push('/foo.txt', '/tmp/foo.txt', {receiver});
        expect(getLogImpl()['calls']).toHaveLength(2);
        expect(getLogImpl()['calls'][0]).toMatchObject({
            color: 'green',
            message: '/foo.txt >> /tmp/foo.txt'
        });
        expect(getLogImpl()['calls'][1]).toMatchObject({
            color: 'green',
            message: 'total 1, success 1, fail 0'
        });
    });

    it('并发三个文件', async () => {
        mock({
            '/foo.txt': 'FOO',
            '/bar.txt': 'BAR',
            '/coo.txt': 'COO',
            [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT
        });
        await pushMultiple([
            {source: '/foo.txt', dest: '/tmp/foo.txt'},
            {source: '/bar.txt', dest: '/tmp/bar.txt'},
            {source: '/coo.txt', dest: '/tmp/coo.txt'}
        ], {receiver});
        expect(getLogImpl()['calls']).toHaveLength(4);
        expect(getLogImpl()['calls'][0]).toMatchObject({
            color: 'green',
            message: '/foo.txt >> /tmp/foo.txt'
        });
        expect(getLogImpl()['calls'][1]).toMatchObject({
            color: 'green',
            message: '/bar.txt >> /tmp/bar.txt'
        });
        expect(getLogImpl()['calls'][2]).toMatchObject({
            color: 'green',
            message: '/coo.txt >> /tmp/coo.txt'
        });
        expect(getLogImpl()['calls'][3]).toMatchObject({
            color: 'green',
            message: 'total 3, success 3, fail 0'
        });
    });
});
