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
        const email = u.Attributes?.find(a => a.Name === 'email')?.Value || ''
        const id = u.Attributes?.find(a => a.Name === 'sub')?.Value || ''

        const groupResponse = await client.send(new AdminListGroupsForUserCommand({
            UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
            Username: u.Username!,
        }))
        const groups = (groupResponse.Groups || []).map(g => g.GroupName)

        usersWithGroups.push({
            id,
            email,
            groups
        })
    }

    return usersWithGroups as any
}

