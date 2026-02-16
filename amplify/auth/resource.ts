import {defineAuth, secret} from '@aws-amplify/backend';
import {postConfirmation} from './post-confirmation/resource';
import {postAuthentication} from './post-authentication/resource';

export const auth = defineAuth({
    loginWith: {
        email: true,
        externalProviders: {
            google: {
                clientId: secret('GOOGLE_CLIENT_ID'),
                clientSecret: secret('GOOGLE_CLIENT_SECRET'),
                scopes: ['email'],
                attributeMapping: {
                    email: 'email'
                }
            },
            callbackUrls: [
                'https://dcad610d56d2f7dc2120.auth.eu-central-1.amazoncognito.com',
                'https://ad77271eca38abe45ab6.auth.eu-central-1.amazoncognito.com',
                'https://f75ab5ba7777e2ccc233.auth.eu-central-1.amazoncognito.com',
                'http://localhost:5173',
                'https://www.data.global.health',
                'https://www.dev.data.global.health',
                'https://auth.global.health'
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
