const {rule} = require('makit');
const fhp = require('fis-http-push');

const receiver = process.env.RECEIVER || 'http://example.com:8210';

rule(`${receiver}/tmp/foo.txt`, 'foo.txt', fhp.makit({logLevel: 6}));
rule('deploy', `${receiver}/tmp/foo.txt`);
