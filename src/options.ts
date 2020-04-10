type OnEnd = (totalCount: number, successCount: number, failCount: number) => void

type OnProcess = (options: { path: string, to: string }) => void

export interface Options {
    receiver: string;
    retry?: number;
    parallelPushCount?: number;
    onEnd?: OnEnd;
    onProcess?: OnProcess;
    readEmail?: (savedEmail: string) => Promise<string>;
    readCode?: () => Promise<string>;
}

export interface FullOptions extends Options {
    retry: number;
    parallelPushCount: number;
    uploadAPI: string;
    authAPI: string;
    validateAPI: string;
}

export function normalize(options: Options): FullOptions {
    if (!options.receiver) throw new Error('options.receiver is required!');
    return {
        ...options,
        uploadAPI: options.receiver + '/v1/upload',
        authAPI: options.receiver + '/v1/authorize',
        validateAPI: options.receiver + '/v1/validate',
        retry: options.retry || 3,
        parallelPushCount: options.parallelPushCount || 100
    };
}
