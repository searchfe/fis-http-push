import {resolve} from 'path';
import {debug, LogLevel} from './util/log';

type OnEnd = (totalCount: number, successCount: number, failCount: number) => void

type OnProcess = (options: { path: string, to: string }) => void

type OptionsPath = string

type OptionsLiteral = {
    // 服务端接收 URL，例如：http://example.com:8210
    receiver: string;
    // 日志级别，默认为 LogLevel.INFO
    logLevel: LogLevel;
    // 是否递归，默认为 false
    recursive: boolean;
    // 重试次数，默认为 3
    retry: number;
    // 是否在第一个错误时退出，默认为 false
    fastFail: boolean;
    // 并发数，默认为 100
    concurrent: number;
    // concurrent 的别名，兼容旧版配置
    parallelPushCount: number;
    // 自定义读取用户邮箱的方法
    readEmail: (savedEmail: string) => Promise<string>;
    // 自定义读取验证码的方法
    readCode: () => Promise<string>;
}

export type Options = OptionsPath | Partial<OptionsLiteral>;

// 归一化后能够方便处理的字段，进行归一化。这是归一化之后的参数类型。
export interface NormalizedOptions extends Partial<OptionsLiteral> {
    receiver: string;
    retry: number;
    concurrent: number;
    uploadAPI: string;
    authAPI: string;
    validateAPI: string;
    normalized: true;
}

export function normalize(raw: Options, additional: Partial<OptionsLiteral> = {}): NormalizedOptions {
    const options: Partial<OptionsLiteral> = {
        ...(typeof raw === 'string' ? require(resolve(process.cwd(), raw)) : raw),
        ...additional
    };
    debug('options', options, 'parsed from raw: ', raw, 'additional:', additional);
    if (!options.receiver) throw new Error('options.receiver is required!');
    return {
        ...options,
        receiver: options.receiver,
        logLevel: defaultTo(options.logLevel, LogLevel.INFO),
        recursive: defaultTo(options.recursive, false),
        uploadAPI: options.receiver + '/v1/upload',
        authAPI: options.receiver + '/v1/authorize',
        validateAPI: options.receiver + '/v1/validate',
        retry: defaultTo(options.retry, 3),
        concurrent: defaultTo(options.concurrent, options.parallelPushCount, 100),
        normalized: true
    };
}

function defaultTo<T>(...args: (T | undefined)[]) {
    for (const arg of args) if (arg !== undefined) return arg;
}

export function isNormalizedOptions(options: Options | NormalizedOptions): options is NormalizedOptions {
    return options['normalized'];
}
