import {defineAuth, secret} from '@aws-amplify/backend';
import {postConfirmation} from './post-confirmation/resource';
import {postAuthentication} from './post-authentication/resource';

export const auth = defineAuth({
    loginWith: {
        email: true,
        externalProviders: {
            google: {
                clientId: secret('GOOGLE_CLIENT_ID'),
                clientSecret: secret('GOOGLE_CLIENT_SECRET')
            },
            callbackUrls: [
                'http://localhost:5173/oauth2/idpresponse',
                'https://data.global.health/oauth2/idpresponse',
                'https://dev.data.global.health/oauth2/idpresponse'
            ],
            logoutUrls: ['http://localhost:5173', 'https://data.global.health',
                'https://dev.data.global.health'],
        },
    },
    triggers: {
        postConfirmation,
        postAuthentication
    }
});
