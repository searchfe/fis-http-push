import {makit} from '../src';
import {clear, FHP_TOKEN_FILE} from '../src/token';
import {debug} from '../src/util/log';
import {startServer, receiver, serverFileSystem} from './stub/server';
import {mock, restore} from './stub/fs';
import {TOKEN_FILE_CONTENT} from './stub/token';

describe('makit 插件', () => {
    const logLevel = 6;
    beforeEach(() => {
        clear();
        startServer();
    });
    afterEach(() => {
        restore();
        jest.restoreAllMocks();
    });

    it('上传单个文件', async () => {
        mock({'/foo.txt': 'FOO', [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT});
        await makit({logLevel})({
            dependencyFullPath: () => '/foo.txt',
            target: `${receiver}/tmp/foo.txt`
        } as any);
        expect(serverFileSystem.get('/tmp/foo.txt')).toEqual('FOO');
    });

    it('支持 JS 配置文件', async () => {
        mock({
            '/foo.txt': 'FOO',
            [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT
        });
        jest.mock(
            '/dev.config.js',
            () => ({logLevel, receiver}),
            {virtual: true}
        );
        await makit('/dev.config.js')({
            dependencyFullPath: () => '/foo.txt',
            target: 'receiver:/tmp/foo.txt'
        } as any);
        expect(serverFileSystem.get('/tmp/foo.txt')).toEqual('FOO');
    });

    it('支持 JSON 配置文件', async () => {
        mock({
            '/foo.txt': 'FOO',
            [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT
        });
        jest.mock(
            '/dev.config.json',
            () => ({logLevel, receiver}),
            {virtual: true}
        );
        await makit('/dev.config.json')({
            dependencyFullPath: () => '/foo.txt',
            target: 'receiver:/tmp/foo.txt'
        } as any);

        expect(serverFileSystem.get('/tmp/foo.txt')).toEqual('FOO');
    });

    it('发生错误时 make 操作应该拒绝', async () => {
        mock({
            [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT
        });
        const recipe = makit({logLevel, receiver});
        return expect(recipe({
            dependencyFullPath: () => '/foo.txt',
            target: 'receiver:/tmp/foo.txt'
        } as any)).rejects.toMatchObject({
            message: expect.stringMatching(/Upload file .* failed: "ENOENT"/)
        });
    });
});
