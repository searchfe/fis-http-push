#!/usr/bin/env node

import {main} from './main';

main(process.argv).catch(err => {
    console.error(err.message); // eslint-disable-line
    process.exit(1);
});
