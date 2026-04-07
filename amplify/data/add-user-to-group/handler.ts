import type {Schema} from "../resource"
import {env} from "$amplify/env/add-user-to-group"
import {
    AdminAddUserToGroupCommand,
    CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider"

type Handler = Schema["addUserToGroup"]["functionHandler"]
const client = new CognitoIdentityProviderClient()

export const handler: Handler = async (event) => {
    const {username, groupName} = event.arguments
    const command = new AdminAddUserToGroupCommand({
        Username: username,
        GroupName: groupName,
        UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    })
    return await client.send(command)
}