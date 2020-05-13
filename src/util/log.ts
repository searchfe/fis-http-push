import {inspect} from 'util';
import chalk from 'chalk';
import debugFactory from 'debug';

export enum OutStream {
    STDOUT = 'stdout',
    STDERR = 'stderr'
}

export enum LogLevel {
    NONE = 5,
    ERROR = 4,
    WARN = 3,
    INFO = 2,
    DEBUG = 1
}

let logLevel = LogLevel.INFO;

export function setLogLevel(level: LogLevel) {
    if (typeof level === 'number') logLevel = level;
}
export function getLogLevel() {
    return logLevel;
}

/**
 * Log Implementation
 */
let impl = defaultLogImpl;
export function setLogImpl(newImpl) {
    impl = newImpl;
}
export function getLogImpl() {
    return impl;
}
export function restoreLogImpl() {
    impl = defaultLogImpl;
}

/**
 * Log Interfaces
 */
export function error(...args) {
    return impl(OutStream.STDERR, LogLevel.ERROR, 'red', ...args);
}
export function warn(...args) {
    return impl(OutStream.STDERR, LogLevel.WARN, 'yellow', ...args);
}
export function success(...args) {
    return impl(OutStream.STDOUT, LogLevel.INFO, 'green', ...args);
}
export function log(...args) {
    return impl(OutStream.STDOUT, LogLevel.INFO, 'dim', ...args);
}
export function raw(...args) {
    return impl(OutStream.STDOUT, LogLevel.INFO, 'raw', ...args);
}
export function debug(...args) {
    const level = process.env.DEBUG === 'fhp' ? Infinity : LogLevel.DEBUG;
    return impl(OutStream.STDERR, level, 'raw', ...args);
}

export function dateStr(now = new Date()) {
    const m = now.getMonth() + 1;
    const d = now.getDate();
    return (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d) + ' ' + now.toTimeString().substr(0, 8);
}

export function defaultLogImpl(out: OutStream, level: LogLevel, color: string, ...args) {
    if (level < logLevel) return;

    let timeInfo = '[' + dateStr() + ']';
    let str = color === 'raw' ? timeInfo : chalk[color](timeInfo);
    for (const arg of args) {
        str += ' ';
        str += inspect(arg);
    }
    str += '\n';
    process[out].write(str);
    return str;
}
