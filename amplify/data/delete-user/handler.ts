import type {Schema} from "../resource"
import {env} from "$amplify/env/delete-user"
import {
    AdminDeleteUserCommand,
    AdminListGroupsForUserCommand,
    CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider"
import {Group} from "../../auth/groups";

type Handler = Schema["deleteUser"]["functionHandler"]
const client = new CognitoIdentityProviderClient()

export const handler: Handler = async (event) => {
    const {username} = event.arguments

    const listGroupsCommand = new AdminListGroupsForUserCommand({
        Username: username,
        UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    })
    const groupsResponse = await client.send(listGroupsCommand)
    const isAdmin = groupsResponse.Groups?.some((group) => group.GroupName === Group.Admin)

    if (isAdmin) {
        throw new Error("User cannot be deleted because they are in the ADMINS group.")
    }

    const command = new AdminDeleteUserCommand({
        Username: username,
        UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    })
    return await client.send(command)
}
