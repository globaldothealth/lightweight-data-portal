import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
    name: 'amplify-data-bucket',
    isDefault: true,
    access: (allow) => ({
        'public/*': [
            allow.authenticated.to(['read']),
        ],
    })
});
