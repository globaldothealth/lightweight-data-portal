import type {Schema} from "../resource"
import {env} from "$amplify/env/remove-user-from-group"
import {
    AdminRemoveUserFromGroupCommand,
    CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider"

type Handler = Schema["removeUserFromGroup"]["functionHandler"]
const client = new CognitoIdentityProviderClient()

export const handler: Handler = async (event) => {
    const {username, groupName} = event.arguments
    const command = new AdminRemoveUserFromGroupCommand({
        Username: username,
        GroupName: groupName,
        UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    })
    return await client.send(command)
}

