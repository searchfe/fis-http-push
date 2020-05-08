import mock from 'mock-fs';
import {makit} from '../src';
import {clear, FHP_TOKEN_FILE} from '../src/token';
import {startServer, receiver, serverFileSystem} from './stub/server';
import {TOKEN_FILE_CONTENT} from './stub/token';

describe('makit 插件', () => {
    beforeEach(() => {
        clear();
        startServer();
    });
    afterEach(() => {
        mock.restore();
    });

    it('上传单个文件', async () => {
        mock({'/foo.txt': 'FOO', [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT});
        await makit()({
            dependencyFullPath: () => '/foo.txt',
            target: `${receiver}/tmp/foo.txt`
        } as any);
        expect(serverFileSystem.get('/tmp/foo.txt')).toEqual('FOO');
    });
});
