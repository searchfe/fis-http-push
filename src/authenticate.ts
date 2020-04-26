import * as prompt from 'prompt';
import debugFactory from 'debug';
import {postURLEncoded} from './util/request';
import {getToken, writeToken} from './token';
import {fromCallback} from './util/promise';
import {log} from './util/log';

const debug = debugFactory('fhp');
prompt.start();

const defaultReadEmail = savedEmail => fromCallback<{email: string}>(cb => prompt.get({
    properties: {
        email: {
            default: savedEmail,
            description: 'Enter your email',
            message: 'The specified value must be a valid email address.',
            pattern: /^([\w-.]+)@([\w-.]+)\.([a-z]{2,5})$/i,
            required: true
        }
    }
}, cb)).then(ret => ret.email);

const defaultReadCode = () => fromCallback<{code: string}>(cb => prompt.get({
    'properties': {
        'code': {
            'description': 'Enter your code',
            'hide': true,
            'required': true
        }
    }
}, cb)).then(ret => ret.code);

// TODO remove prevError
export async function authenticate(options, prevError): Promise<any> {
    debug('require email called');
    const {
        authAPI,
        validateAPI,
        readEmail = defaultReadEmail,
        readCode = defaultReadCode
    } = options;

    const info = getToken();
    if (info.email) {
        process.stdout.write('Token is invalid: ' + prevError.errmsg + '\n');
    }

    const email = await readEmail(info.email);
    debug('email input:', email);
    info.email = email;
    writeToken(info);

    await postURLEncoded(authAPI, {email});
    log('We\'ve already sent the code to your email.');
    await requireToken(validateAPI, info, readCode);
}

async function requireToken(validateApi, info, readCode) {
    const code = await readCode();
    debug('code input:', code);
    info.code = code;
    writeToken(info);
    const res = await postURLEncoded(validateApi, {
        'code': info.code,
        'email': info.email
    });
    info.token = res['data'].token;
    writeToken(info);
}
