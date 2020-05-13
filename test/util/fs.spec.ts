import {listFilesRecursively} from '../../src/util/fs';
import {mock, restore} from '../stub/fs';

describe('.listFilesRecursively()', () => {
    afterEach(() => restore());

    it('单个文件', async () => {
        mock({'/foo.txt': 'FOO'});
        return expect(listFilesRecursively('/foo.txt')).rejects.toMatchObject({
            message: 'ENOTDIR, not a directory \'/foo.txt\''
        });
    });

    it('单个文件的文件夹', async () => {
        mock({'foo': {'foo.txt': 'FOO'}});
        const list = await listFilesRecursively('foo');
        expect(list).toEqual(['foo/foo.txt']);
    });

    it('多个文件的文件夹', async () => {
        mock({'foo': {'foo.txt': 'FOO', 'bar': 'BAR'}});
        const list = await listFilesRecursively('foo');
        expect(list.sort()).toEqual(['foo/foo.txt', 'foo/bar'].sort());
    });

    it('深层文件夹', async () => {
        mock({'foo': {'foo.txt': 'FOO', bar: {'coo.py': 'COO'}}});
        const list = await listFilesRecursively('foo');
        expect(list.sort()).toEqual(['foo/foo.txt', 'foo/bar/coo.py'].sort());
    });

    it('忽略空文件夹', async () => {
        mock({'foo': {'foo.txt': 'FOO', bar: {'coo.py': 'COO'}, coo: {}}});
        const list = await listFilesRecursively('foo');
        expect(list.sort()).toEqual(['foo/foo.txt', 'foo/bar/coo.py'].sort());
    });
});
