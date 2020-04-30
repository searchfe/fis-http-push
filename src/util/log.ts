import chalk from 'chalk';
import debugFactory from 'debug';

export const debug = debugFactory('fhp');

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

export function success(...args) {
    impl(0, 'green', ...args);
}

export function error(...args) {
    impl(1, 'red', ...args);
}

export function log(...args) {
    impl(0, 'dim', ...args);
}

function dateStr() {
    const now = new Date();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    return (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d) + ' ' + now.toTimeString().substr(0, 8);
}

/**
 * @param out 0 为 STDOUT，1 为 STDERR
 */
function defaultLogImpl(out: 0 | 1, color: string, ...args) {
    const timeInfo = '[' + dateStr() + ']';
    process[out ? 'stderr' : 'stdout'].write(chalk[color](timeInfo));
    for (const arg of args) {
        process.stdout.write(' ');
        process.stdout.write(arg);
    }
    process.stdout.write('\n');
}
