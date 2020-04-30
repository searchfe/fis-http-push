import {join} from 'path';
import assert from 'assert';
import debugFactory from 'debug';
import {Upload} from './upload';
import {Options} from './options';
import {stat, listFilesRecursively} from './util/fs';
import {success, error} from './util/log';

const debug = debugFactory('fhp');

interface Task {
    // 本地文件路径，基于 cwd 解析
    source: string
    // 远程文件路径，为绝对路径
    dest: string
}

/**
 * 拷贝文件。行为类似 fcp、scp，和 push()、pushMultiple() 的不同在于：
 * 1. source 可以是目录，会递归进去拷贝
 * 2. dest 可以以 / 结尾表示放到目录下面
 *
 * @param sources 本地文件/目录路径列表，基于 cwd 解析
 * @param dest 远程文件路径，为绝对路径
 * @param options 推送参数
 */
export async function fcp(sources: string | string[], dest: string, options: Options) {
    debug('fcp called with', sources, dest, options);
    if (!Array.isArray(sources)) sources = [sources];

    const copyInto = sources.length > 1 || dest[dest.length - 1] === '/';
    const tasks: Task[] = [];
    for (const source of sources) {
        const sourceStat = await stat(source);
        // source: ./foo/dir or dir/ or dir, dest: /tmp/foo or /tmp/foo/
        if (sourceStat.isDirectory()) {
            assert(options.recursive, `-r not specified; omitting directory ${source}`);
            for (const file of await listFilesRecursively(source.replace(/\/$/g, ''))) {
                // file: ./foo/dir/foo.txt or dir/foo.txt
                const destFileName = copyInto ? join(dest, file) : join(dest, file.substr(source.length + 1));
                tasks.push({source: file, dest: destFileName});
            }
        }
        else {
            tasks.push({source, dest: copyInto ? join(dest, source) : dest});
        }
    }
    return push(tasks, options);
}

/**
 * 推送一组文件
 *
 * @param tasks 一组文件推送任务
 * @param options 推送参数
 */
export async function push(tasks: Task[], options: Options) {
    const upload = new Upload(options);

    let successCount = 0;
    let failCount = 0;

    const pending = tasks.map(
        ({source, dest}) => upload.upload(source, dest)
            .then(() => {
                successCount++;
                success(source, '>>', dest);
            })
            .catch((err: Error) => {
                failCount++;
                err['task'] = {source, dest};
                if (options.fastFail) throw err;
                error(failMessage(err, source, dest, options));
            })
    );

    await Promise.all(pending).catch(err => {
        if (err['task']) {
            const {source, dest} = err['task'];
            err.message = failMessage(err, source, dest, options);
        }
        throw err;
    });
    success(`total ${pending.length}, success ${successCount}, fail ${failCount}`);
}

/**
 * 推送单个文件
 *
 * @param source 本地文件路径，基于 cwd 解析
 * @param dest 远程文件路径，为绝对路径
 * @param options 推送参数
 */
export async function pushFile(source: string, dest: string, options: Options) {
    return push([{source, dest}], options);
}


function failMessage(err: Error, source: string, dest: string, options: Options) {
    return `Upload file "${source}" to "${options.receiver}${dest}" failed: "${err.message}"`;
}
