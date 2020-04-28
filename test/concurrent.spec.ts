import mock from 'mock-fs';
import {push, pushMultiple} from '../src';
import {clear, FHP_TOKEN_FILE} from '../src/token';
import {startServer, maxConcurrent, receiver, serverFileSystem} from './stub/server';
import {TOKEN_FILE_CONTENT} from './stub/token';

describe('并发上传场景', () => {
    beforeEach(() => {
        clear();
        startServer();
    });
    afterEach(() => mock.restore());

    it('push 上传单个文件', async () => {
        mock({'/foo.txt': 'FOO', [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT});
        await push('/foo.txt', '/tmp/foo.txt', {receiver});
        expect(serverFileSystem.get('/tmp/foo.txt')).toEqual('FOO');
    });

    it('pushMultiple 并发 3 个文件', async () => {
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
        expect(serverFileSystem.get('/tmp/foo.txt')).toEqual('FOO');
        expect(serverFileSystem.get('/tmp/bar.txt')).toEqual('BAR');
        expect(serverFileSystem.get('/tmp/coo.txt')).toEqual('COO');
    });

    it('并发 3 个 push', async () => {
        mock({
            '/foo.txt': 'FOO',
            '/bar.txt': 'BAR',
            '/coo.txt': 'COO',
            [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT
        });
        await Promise.all([
            push('/foo.txt', '/tmp/foo.txt', {receiver}),
            push('/bar.txt', '/tmp/bar.txt', {receiver}),
            push('/coo.txt', '/tmp/coo.txt', {receiver})
        ]);
        expect(serverFileSystem.get('/tmp/foo.txt')).toEqual('FOO');
        expect(serverFileSystem.get('/tmp/bar.txt')).toEqual('BAR');
        expect(serverFileSystem.get('/tmp/coo.txt')).toEqual('COO');
        expect(maxConcurrent).toEqual(3);
    });

    it('并发 3 个 push，控制并发到 2', async () => {
        mock({
            '/foo.txt': 'FOO',
            '/bar.txt': 'BAR',
            '/coo.txt': 'COO',
            [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT
        });
        await Promise.all([
            push('/foo.txt', '/tmp/foo.txt', {receiver, concurrent: 2}),
            push('/bar.txt', '/tmp/bar.txt', {receiver, concurrent: 2}),
            push('/coo.txt', '/tmp/coo.txt', {receiver, concurrent: 2})
        ]);
        expect(serverFileSystem.get('/tmp/foo.txt')).toEqual('FOO');
        expect(serverFileSystem.get('/tmp/bar.txt')).toEqual('BAR');
        expect(serverFileSystem.get('/tmp/coo.txt')).toEqual('COO');
        expect(maxConcurrent).toEqual(2);
    });
});
