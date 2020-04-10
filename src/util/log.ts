import chalk from 'chalk';

function impl(color, ...args) {
    const timeInfo = '[' + dateStr() + ']';
    process.stdout.write(chalk[color](timeInfo));
    for (const arg of args) {
        process.stdout.write(' ');
        process.stdout.write(arg);
    }
    process.stdout.write('\n');
}

export function success(...args) {
    impl('green', ...args);
}

export function log(...args) {
    impl('dim', ...args);
}

function dateStr() {
    const now = new Date();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    return (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d) + ' ' + now.toTimeString().substr(0, 8);
}
