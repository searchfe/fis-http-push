export function tryParseJSON<T = Object>(str: string): T | null {
    try {
        return JSON.parse(str);
    }
    catch (e) {
        return null;
    }
}
