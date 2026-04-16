import type { Schema } from "../resource"
import { env } from "$amplify/env/get-users"
import {
    ListUsersCommand,
    ListUsersInGroupCommand,
    CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider"
import { Group } from "../../auth/groups"

type Handler = Schema["getUsers"]["functionHandler"]
export const handler: Handler = async () => {
    const client = new CognitoIdentityProviderClient()

    // Fetch all users with pagination
    const allUsers = []
    let usersPaginationToken: string | undefined = undefined
    do {
        const listUsersCommand: any = new ListUsersCommand({
            UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
            PaginationToken: usersPaginationToken,
        })
        const response: any = await client.send(listUsersCommand)
        allUsers.push(...(response.Users || []))
        usersPaginationToken = response.PaginationToken
    } while (usersPaginationToken)

    const userGroupsMap = new Map<string, string[]>()

    // For each group, fetch its users and populate the userGroupsMap, handle pagination for users in group
    for (const groupName of Object.values(Group)) {
        let groupUsersNextToken: string | undefined = undefined
        do {
            const listUsersInGroupCommand: any  = new ListUsersInGroupCommand({
                UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
                GroupName: groupName,
                NextToken: groupUsersNextToken,
            })
            const response: any = await client.send(listUsersInGroupCommand)

            for (const u of response.Users || []) {
                const username = u.Username!
                if (!userGroupsMap.has(username)) {
                    userGroupsMap.set(username, [])
                }
                userGroupsMap.get(username)!.push(groupName)
            }
            groupUsersNextToken = response.NextToken
        } while (groupUsersNextToken)
    }

    const usersWithGroups = []
    for (const u of allUsers) {
        const email = u.Attributes?.find((attribute: any) => attribute.Name === 'email')?.Value || ''
        const username = u.Username!

        usersWithGroups.push({
            username,
            email,
            groups: userGroupsMap.get(username) || []
        })
    }

    return usersWithGroups as any
}
