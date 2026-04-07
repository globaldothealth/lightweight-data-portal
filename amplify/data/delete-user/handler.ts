import type {Schema} from "../resource"
import {env} from "$amplify/env/delete-user"
import {
    AdminDeleteUserCommand,
    CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider"

type Handler = Schema["deleteUser"]["functionHandler"]
const client = new CognitoIdentityProviderClient()

export const handler: Handler = async (event) => {
    const {username} = event.arguments
    const command = new AdminDeleteUserCommand({
        Username: username,
        UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    })
    return await client.send(command)
}

