import {pushFile, push} from '../src';
import {clear, FHP_TOKEN_FILE} from '../src/token';
import {startServer, maxConcurrent, receiver, serverFileSystem} from './stub/server';
import {TOKEN_FILE_CONTENT} from './stub/token';
import {mock, restore} from './stub/fs';

describe('并发上传场景', () => {
    const logLevel = 6;

    beforeEach(() => {
        clear();
        startServer();
    });
    afterEach(restore);

    it('pushFile 上传单个文件', async () => {
        mock({'/foo.txt': 'FOO', [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT});
        await pushFile('/foo.txt', '/tmp/foo.txt', {receiver, logLevel});
        expect(serverFileSystem.get('/tmp/foo.txt')).toEqual('FOO');
    });

    it('cp 并发 3 个文件', async () => {
        mock({
            '/foo.txt': 'FOO',
            '/bar.txt': 'BAR',
            '/coo.txt': 'COO',
            [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT
        });
        await push([
            {source: '/foo.txt', dest: '/tmp/foo.txt'},
            {source: '/bar.txt', dest: '/tmp/bar.txt'},
            {source: '/coo.txt', dest: '/tmp/coo.txt'}
        ], {receiver, logLevel: 6});
        expect(serverFileSystem.get('/tmp/foo.txt')).toEqual('FOO');
        expect(serverFileSystem.get('/tmp/bar.txt')).toEqual('BAR');
        expect(serverFileSystem.get('/tmp/coo.txt')).toEqual('COO');
    });

    it('并发 3 个 pushFile', async () => {
        mock({
            '/foo.txt': 'FOO',
            '/bar.txt': 'BAR',
            '/coo.txt': 'COO',
            [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT
        });
        await Promise.all([
            pushFile('/foo.txt', '/tmp/foo.txt', {receiver, logLevel}),
            pushFile('/bar.txt', '/tmp/bar.txt', {receiver, logLevel}),
            pushFile('/coo.txt', '/tmp/coo.txt', {receiver, logLevel})
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
            pushFile('/foo.txt', '/tmp/foo.txt', {receiver, concurrent: 2, logLevel}),
            pushFile('/bar.txt', '/tmp/bar.txt', {receiver, concurrent: 2, logLevel}),
            pushFile('/coo.txt', '/tmp/coo.txt', {receiver, concurrent: 2, logLevel})
        ]);
        expect(serverFileSystem.get('/tmp/foo.txt')).toEqual('FOO');
        expect(serverFileSystem.get('/tmp/bar.txt')).toEqual('BAR');
        expect(serverFileSystem.get('/tmp/coo.txt')).toEqual('COO');
        expect(maxConcurrent).toEqual(2);
    });
});
