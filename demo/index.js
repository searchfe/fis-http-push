const {resolve} = require('path');
const {push} = require('../dist/index.js');

const path = resolve(__dirname, './foo.txt');
const to = '/tmp/foo.txt';
const receiver = 'http://example.com:8210';

push(path, to, {receiver})
    .then(result => console.log(result)) // eslint-disable-line no-console
    .catch(err => console.error(err)); // eslint-disable-line no-console
