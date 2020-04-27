import mock from 'mock-fs';
import {push, pushMultiple} from '../src';
import {clear, FHP_TOKEN_FILE} from '../src/token';
import {startServer, receiver, serverFileSystem} from './stub/server';
import {TOKEN_FILE_CONTENT} from './stub/token';

describe('并发上传场景', () => {
    beforeEach(() => {
        clear();
        startServer();
    });
    afterEach(() => mock.restore());

    it('上传单个文件', async () => {
        mock({'/foo.txt': 'FOO', [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT});
        await push('/foo.txt', '/tmp/foo.txt', {receiver});
        expect(serverFileSystem.get('/tmp/foo.txt')).toEqual('FOO');
    });

    it('并发三个文件', async () => {
        mock({
            '/foo.txt': 'FOO',
            '/bar.txt': 'BAR',
            '/coo.txt': 'COO',
            [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT
        });
        await pushMultiple([
            {path: '/foo.txt', to: '/tmp/foo.txt'},
            {path: '/bar.txt', to: '/tmp/bar.txt'},
            {path: '/coo.txt', to: '/tmp/coo.txt'}
        ], {receiver});
        expect(serverFileSystem.get('/tmp/foo.txt')).toEqual('FOO');
        expect(serverFileSystem.get('/tmp/bar.txt')).toEqual('BAR');
        expect(serverFileSystem.get('/tmp/coo.txt')).toEqual('COO');
    });
});
