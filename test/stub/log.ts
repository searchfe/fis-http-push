export function mockLogImpl() {
    function impl(color, ...args) {
        impl.calls.push({color, args, message: args.join(' ')});
    }
    impl.calls = [];
    return impl;
}
