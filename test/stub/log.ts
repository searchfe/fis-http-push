import {getLogLevel, LogLevel, OutStream} from '../../src/util/log';

export function mockLogImpl() {
    function impl(out: OutStream, level: LogLevel, color: string, ...args) {
        if (level < getLogLevel()) return;
        impl.calls.push({out, color, args, message: args.join(' ')});
    }
    impl.calls = [];
    return impl;
}
