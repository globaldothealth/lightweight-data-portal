import type { Schema } from "../resource"
import { env } from "$amplify/env/get-users"
import {
    ListUsersCommand,
    ListGroupsCommand,
    ListUsersInGroupCommand,
    CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider"

type Handler = Schema["getUsers"]["functionHandler"]
export const handler: Handler = async () => {
    const client = new CognitoIdentityProviderClient()

    const listUsersCommand = new ListUsersCommand({
        UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    })
    const { Users } = await client.send(listUsersCommand)

    const listGroupsCommand = new ListGroupsCommand({
        UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    })
    const { Groups } = await client.send(listGroupsCommand)

    const userGroupsMap = new Map<string, string[]>()

    for (const group of Groups || []) {
        const groupName = group.GroupName!
        const listUsersInGroupCommand = new ListUsersInGroupCommand({
            UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
            GroupName: groupName,
        })
        const groupUsers = await client.send(listUsersInGroupCommand)

        for (const u of groupUsers.Users || []) {
            const username = u.Username!
            if (!userGroupsMap.has(username)) {
                userGroupsMap.set(username, [])
            }
            userGroupsMap.get(username)!.push(groupName)
        }
    }

    const usersWithGroups = []
    for (const u of Users || []) {
        const email = u.Attributes?.find(attribute => attribute.Name === 'email')?.Value || ''
        const username = u.Username!

        usersWithGroups.push({
            username,
            email,
            groups: userGroupsMap.get(username) || []
        })
    }

    return usersWithGroups as any
}
