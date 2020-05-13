const {rule} = require('makit');
const fhp = require('fis-http-push');

const receiver = process.env.RECEIVER || 'http://example.com:8210';

rule(`${receiver}/tmp/foo.txt`, 'foo.txt', fhp.makit({logLevel: 6}));
// or:
// rule(`http://example.com:8210/tmp/foo.txt`, 'foo.txt', fhp.makit({logLevel: 6}));
// or:
// rule(`receiver:/tmp/foo.txt`, 'foo.txt', fhp.makit({logLevel: 6, receiver: 'http://example.com:8210}));
// or:
// rule(`receiver:/tmp/foo.txt`, 'foo.txt', fhp.makit('./dev.config.js));

rule('deploy', `${receiver}/tmp/foo.txt`);
