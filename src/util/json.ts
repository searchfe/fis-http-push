export function tryParseJSON<T = Object>(str: string, defaultValue = null): T | null {
    try {
        return JSON.parse(str);
    }
    catch (e) {
        return defaultValue;
    }
}
