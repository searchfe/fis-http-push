import {push, pushFile} from '../src';
import {clear, FHP_TOKEN_FILE} from '../src/token';
import {getLogImpl, setLogImpl, restoreLogImpl} from '../src/util/log';
import {startServer, receiver} from './stub/server';
import {TOKEN_FILE_CONTENT} from './stub/token';
import {mockLogImpl} from './stub/log';
import {mock, restore} from './stub/fs';

describe('日志参数', () => {
    jest.mock('../src/util/log');
    beforeEach(() => {
        clear();
        startServer();
        setLogImpl(mockLogImpl());
    });
    afterEach(() => {
        restore();
        restoreLogImpl();
    });

    it('上传单个文件', async () => {
        mock({'/foo.txt': 'FOO', [FHP_TOKEN_FILE]: TOKEN_FILE_CONTENT});
        await pushFile('/foo.txt', '/tmp/foo.txt', {receiver});
        expect(getLogImpl()[0]['calls']).toHaveLength(2);
        expect(getLogImpl()[0]['calls'][0].msg).toContain('/foo.txt >> /tmp/foo.txt');
        expect(getLogImpl()[0]['calls'][1].msg).toContain('total 1, success 1, fail 0');
    });

    it('并发三个文件', async () => {
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
        ], {receiver});
        expect(getLogImpl()[0]['calls']).toHaveLength(4);
        expect(getLogImpl()[0]['calls'][0].msg).toContain('/foo.txt >> /tmp/foo.txt');
        expect(getLogImpl()[0]['calls'][1].msg).toContain('/bar.txt >> /tmp/bar.txt');
        expect(getLogImpl()[0]['calls'][2].msg).toContain('/coo.txt >> /tmp/coo.txt');
        expect(getLogImpl()[0]['calls'][3].msg).toContain('total 3, success 3, fail 0');
    });
});
