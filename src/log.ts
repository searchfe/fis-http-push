import chalk from 'chalk';

function log(color, ...args) {
    const timeInfo = '[' + dateStr() + ']';
    console.log(chalk[color](timeInfo), ...args) // eslint-disable-line
}

export function success(...args) {
    log('green', ...args);
}

function dateStr() {
    const now = new Date();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    return (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d) + ' ' + now.toTimeString().substr(0, 8);
}
