import type { Schema } from "../resource"
import { env } from "$amplify/env/get-users"
import {
    ListUsersCommand,
    AdminListGroupsForUserCommand,
    CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider"

type Handler = Schema["getUsers"]["functionHandler"]
export const handler: Handler = async () => {
    const client = new CognitoIdentityProviderClient()

    const listUsersCommand = new ListUsersCommand({
        UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    })
    const { Users } = await client.send(listUsersCommand)

    const usersWithGroups = []
    for (const u of Users || []) {
        const email = u.Attributes?.find(attribute => attribute.Name === 'email')?.Value || ''
        const username = u.Username!

        const groupResponse = await client.send(new AdminListGroupsForUserCommand({
            UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
            Username: username,
        }))
        const groups = (groupResponse.Groups || []).map(group => group.GroupName)

        usersWithGroups.push({
            username,
            email,
            groups
        })
    }

    return usersWithGroups as any
}

