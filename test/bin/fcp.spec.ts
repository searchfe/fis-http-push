import {mock, restore} from '../stub/fs';
import {main} from '../../src/bin/main';
import {clear, FHP_TOKEN_FILE} from '../../src/token';
import {version} from '../../package.json';
import {startServer, receiver, serverFileSystem} from '../stub/server';
import {mockLogImpl} from '../stub/log';
import {TOKEN_FILE_CONTENT} from '../stub/token';
import {getLogImpl, setLogImpl, restoreLogImpl} from '../../src/util/log';

describe('bin/fcp', () => {
    beforeEach(() => {
        clear();
        startServer();
        setLogImpl(mockLogImpl());
    });
    afterEach(() => {
        restore();
        restoreLogImpl();
    });

    it('--help', async () => {
        const argv = ['node', 'fcp', '--help'];
        await main(argv);
        expect(getLogImpl()[0]['calls']).toHaveLength(1);
        expect(getLogImpl()[0]['calls'][0].msg).toMatch(/^fcp <SOURCE\.\.> <TARGET>\n/);
    });

    it('--version', async () => {
        const argv = ['node', 'fcp', '--version'];
        await main(argv);
        expect(getLogImpl()[0]['calls']).toHaveLength(1);
        expect(getLogImpl()[0]['calls'][0].msg).toEqual(version);
    });

    it('参数个数不够，抛出异常', async () => {
        const argv = ['node', 'fcp', ''];
        return expect(main(argv)).rejects.toMatchObject({
            message: expect.stringMatching(/fcp missing file operand/)
        });
    });

    it('上传单个文件', async () => {
        mock({'/foo.txt': 'FOO', [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT});
        await main(['node', 'fcp', '/foo.txt', `${receiver}/tmp/foo.txt`]);

        expect(getLogImpl()[0]['calls']).toHaveLength(2);
        expect(getLogImpl()[0]['calls'][0].msg).toContain('/foo.txt >> /tmp/foo.txt');
        expect(getLogImpl()[0]['calls'][1].msg).toContain('total 1, success 1, fail 0');
        expect(serverFileSystem.get('/tmp/foo.txt')).toEqual('FOO');
    });

    it('指定的本地文件不存在时直接异常退出', async () => {
        const argv = ['node', 'fcp', 'none-exist-file', `${receiver}/foo.txt`];
        return expect(main(argv)).rejects.toMatchObject({
            message: expect.stringMatching(/ENOENT: no such file or directory/)
        });
    });

    it('远程发生未知错误，正常退出并打印错误', async () => {
        mock({'/foo.txt': 'FOO', [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT});
        await main(['node', 'fcp', '/foo.txt', `${receiver}/unkown-error`]);
        expect(getLogImpl()[0]['calls']).toHaveLength(1);
        expect(getLogImpl()[0]['calls'][0].msg).toContain('total 1, success 0, fail 1');
        expect(getLogImpl()[1]['calls']).toHaveLength(1);
        expect(getLogImpl()[1]['calls'][0].msg).toContain('Upload file "/foo.txt" to "http://localhost:1080/unkown-error" failed: "500 UNKOWN"');
        expect(serverFileSystem.get('/tmp/foo.txt')).toBeUndefined();
    });
});
