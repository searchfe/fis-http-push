import {join} from 'path';
import assert from 'assert';
import {Context} from 'makit';
import {Upload} from './upload';
import {parseTarget} from './target';
import {Options, NormalizedOptions, isNormalizedOptions, normalize} from './options';
import {stat, listFilesRecursively} from './util/fs';
import {debug, setLogLevel, success, error, log} from './util/log';

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
export async function fcp(sources: string | string[], dest: string, raw: Options) {
    const options = normalize(raw);
    setLogLevel(options.logLevel);
    debug('fcp called with', sources, dest, options);
    if (!Array.isArray(sources)) sources = [sources];

    const copyInto = sources.length > 1 || dest[dest.length - 1] === '/';
    const tasks: Task[] = [];
    for (const source of sources) {
        const sourceStat = await stat(source);
        // source: ./foo/dir or dir/ or dir, dest: /tmp/foo or /tmp/foo/
        if (sourceStat.isDirectory()) {
            assert(options.recursive, `-r not specified; omitting directory ${source}`);
            for (const file of await listFilesRecursively(source.replace(/\/$/, ''))) {
                // file: ./foo/dir/foo.txt or dir/foo.txt
                const destFileName = copyInto ? join(dest, file) : join(dest, file.substr(source.length + 1));
                tasks.push({source: file, dest: destFileName});
            }
        }
        else {
            tasks.push({source, dest: copyInto ? join(dest, source) : dest});
        }
    }
    if (options.dryrun) {
        for (const task of tasks) {
            log(`${task.source} -> ${task.dest}`);
        }
    }
    else {
        return push(tasks, options);
    }
}

/**
 * 推送一组文件
 *
 * @param tasks 一组文件推送任务
 * @param options 推送参数
 */
export async function push(tasks: Task[], raw: Options | NormalizedOptions) {
    const options = isNormalizedOptions(raw) ? raw : normalize(raw);
    setLogLevel(options.logLevel);
    const upload = new Upload(options);

    let successCount = 0;
    let failCount = 0;

    await Promise.all(tasks.map(pushTask));
    if (tasks.length > 1) {
        success(`total ${tasks.length}, success ${successCount}, fail ${failCount}`);
    }

    async function pushTask({source, dest}) {
        try {
            await upload.upload(source, dest);
            successCount++;
            success(source, '>>', dest);
        }
        catch (err) {
            failCount++;
            err.hrmessage = failMessage(err.message, source, dest, options);
            if (options.fastFail) throw err;
            error(err.hrmessage);
        }
    }
}

/**
 * 推送单个文件
 *
 * @param source 本地文件路径，基于 cwd 解析
 * @param dest 远程文件路径，为绝对路径
 * @param options 推送参数
 */
export async function pushFile(source: string, dest: string, raw: Options | NormalizedOptions) {
    const options = isNormalizedOptions(raw) ? raw : normalize(raw, {fastFail: true});
    return push([{source, dest}], options);
}

export function makit(raw: Options = {}) {
    return function<T extends {target: string, dependencyFullPath: () => string} = Context> (ctx: T) {
        const {receiver, dest} = parseTarget(ctx.target);
        const options = receiver ? normalize(raw, {receiver, fastFail: true}) : normalize(raw, {fastFail: true});
        return pushFile(ctx.dependencyFullPath(), dest, options);
    };
}

function failMessage(message: string, source: string, dest: string, options: NormalizedOptions) {
    return `Upload file "${source}" to "${options.receiver}${dest}" failed: ${message}`;
}
