import {defineAuth, secret} from '@aws-amplify/backend';
import {postConfirmation} from './post-confirmation/resource';
import {postAuthentication} from './post-authentication/resource';
import { addUserToGroup } from "../data/add-user-to-group/resource"
import { removeUserFromGroup } from "../data/remove-user-from-group/resource"
import { deleteUser } from "../data/delete-user/resource"
import { getUsers } from "../data/get-users/resource"
import { getUserProfile } from "../data/get-user-profile/resource"
import { Group } from "./groups"

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
    },
    groups: [Group.ADMINS, Group.CURATORS, Group.RESEARCHERS, Group.Admin, Group.Curator, Group.Researcher],

    access: (allow) => [
        allow.resource(addUserToGroup).to(["addUserToGroup"]),
        allow.resource(removeUserFromGroup).to(["removeUserFromGroup"]),
        allow.resource(deleteUser).to(["deleteUser"]),
        allow.resource(getUsers).to(["listUsers"]),
        allow.resource(getUsers).to(["listGroupsForUser"]),
        allow.resource(getUserProfile).to(["getUser"]),
        allow.resource(getUserProfile).to(["listGroupsForUser"]),
    ],
});
