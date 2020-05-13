import chalk from 'chalk';
import debugFactory from 'debug';

/* eslint-disable no-console */

export enum OutStream {
    STDOUT = 0,
    STDERR = 1
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
let impl = [console.log, console.error];
export function setLogImpl(newImpl) {
    impl = newImpl;
}
export function getLogImpl() {
    return impl;
}
export function restoreLogImpl() {
    impl = [console.log, console.error];
}

/**
 * Log Interfaces
 */
export function error(...args) {
    return doLog(OutStream.STDERR, LogLevel.ERROR, 'red', ...args);
}
export function warn(...args) {
    return doLog(OutStream.STDERR, LogLevel.WARN, 'yellow', ...args);
}
export function success(...args) {
    return doLog(OutStream.STDOUT, LogLevel.INFO, 'green', ...args);
}
export function log(...args) {
    return doLog(OutStream.STDOUT, LogLevel.INFO, 'dim', ...args);
}
export function raw(...args) {
    return impl[0](...args);
}
export function debug(...args) {
    const level = process.env.DEBUG === 'fhp' ? Infinity : LogLevel.DEBUG;
    return doLog(OutStream.STDERR, level, 'none', ...args);
}

export function dateStr(now = new Date()) {
    const m = now.getMonth() + 1;
    const d = now.getDate();
    return (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d) + ' ' + now.toTimeString().substr(0, 8);
}

export function doLog(out: OutStream, level: LogLevel, color: string, ...args) {
    if (level < logLevel) return;

    const timeInfo = '[' + dateStr() + ']';
    args.unshift(color === 'none' ? timeInfo : chalk[color](timeInfo));
    impl[out](...args);
    return args;
}
