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
