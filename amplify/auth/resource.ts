import {defineAuth, secret} from '@aws-amplify/backend';
import {postConfirmation} from './post-confirmation/resource';
import {postAuthentication} from './post-authentication/resource';

export const auth = defineAuth({
    loginWith: {
        email: true,
        // externalProviders: {
        //     google: {
        //         clientId: secret('GOOGLE_CLIENT_ID'),
        //         clientSecret: secret('GOOGLE_CLIENT_SECRET')
        //     },
        //     callbackUrls: [
        //         'http://localhost:5173/profile',
        //         // 'https://mywebsite.com/profile'
        //     ],
        //     logoutUrls: ['http://localhost:5173/'], //, 'https://mywebsite.com'],
        // },
    },
    triggers: {
        postConfirmation,
        postAuthentication
    }
});
