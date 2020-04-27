type OnEnd = (totalCount: number, successCount: number, failCount: number) => void

type OnProcess = (options: { path: string, to: string }) => void

export interface Options {
    // 服务端接收 URL，例如：http://example.com:8210
    receiver: string;
    // 是否递归，默认为 false
    recursive?: boolean;
    // 重试次数，默认为 3
    retry?: number;
    // 是否在第一个错误时退出，默认为 false
    fastFail?: boolean;
    // 并发数，默认为 100
    concurrentLimit?: number;
    // 自定义读取用户邮箱的方法
    readEmail?: (savedEmail: string) => Promise<string>;
    // 自定义读取验证码的方法
    readCode?: () => Promise<string>;
}

export interface FullOptions extends Options {
    retry: number;
    concurrentLimit: number;
    uploadAPI: string;
    authAPI: string;
    validateAPI: string;
}

export function normalize(options: Options): FullOptions {
    if (!options.receiver) throw new Error('options.receiver is required!');
    return {
        ...options,
        recursive: options.recursive || false,
        uploadAPI: options.receiver + '/v1/upload',
        authAPI: options.receiver + '/v1/authorize',
        validateAPI: options.receiver + '/v1/validate',
        retry: options.retry || 3,
        concurrentLimit: options.concurrentLimit || 100
    };
}
