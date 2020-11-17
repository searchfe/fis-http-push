import * as prompt from 'prompt';
import {postURLEncoded} from './util/request';
import {getToken, writeToken} from './token';
import {fromCallback} from './util/promise';
import {log} from './util/log';
import {debug} from './util/log';

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

export async function authenticate(options): Promise<any> {
    debug('authenticate called');
    const {
        authAPI,
        validateAPI,
        readEmail = defaultReadEmail,
        readCode = defaultReadCode
    } = options;

    const info = await getToken();
    const email = await readEmail(info.email);
    debug('email input:', email);
    info.email = email;
    await writeToken(info);

    await postURLEncoded(authAPI, {email});
    log('We\'ve already sent the code to your email.');

    const code = await readCode();
    debug('code input:', code);
    info.code = code;
    await writeToken(info);
    const res = await postURLEncoded(validateAPI, {
        'code': info.code,
        'email': info.email
    });
    info.token = res['data'].token;
    await writeToken(info);
}
