import {inspect} from 'util';

export function mockLogImpl() {
    function stdout(...args) {
        args['msg'] = args.map(serialize).join(' ');
        stdout.calls.push(args);
    }
    function stderr(...args) {
        args['msg'] = args.map(serialize).join(' ');
        stderr.calls.push(args);
    }
    stdout.calls = [];
    stderr.calls = [];
    return [stdout, stderr];
}

function serialize(arg) {
    if (typeof arg === 'string') return arg;
    return inspect(arg);
}
