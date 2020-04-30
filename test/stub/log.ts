export function mockLogImpl() {
    function impl(out, color, ...args) {
        impl.calls.push({out, color, args, message: args.join(' ')});
    }
    impl.calls = [];
    return impl;
}
