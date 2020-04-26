interface Target {
    receiver: string;
    path: string;
}

export function parseTargetUrl(urlStr: string): Target {
    const url = new URL(urlStr);
    return {
        'receiver': url.origin,
        'path': url.pathname
    };
}
