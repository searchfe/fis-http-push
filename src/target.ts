
export interface Target {
    // 目标接收器 URL，例如：http://example.com:8210
    receiver?: string;
    // 目标文件绝对路径，例如：/tmp/foo.txt
    dest: string;
}

export function parseTarget(target: string): Target {
    if (/^receiver:/.test(target)) {
        return {dest: target.slice(9)};
    }
    const url = new URL(target);
    return {receiver: url.origin, dest: url.pathname};
}
