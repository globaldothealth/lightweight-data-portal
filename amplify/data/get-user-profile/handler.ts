import type { Schema } from "../resource"
import { env } from "$amplify/env/get-user-profile"
import {
    AdminListGroupsForUserCommand,
    AdminGetUserCommand,
    CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider"

type Handler = Schema["getUserProfile"]["functionHandler"]

export const handler: Handler = async (event) => {
    const client = new CognitoIdentityProviderClient()

    const identity = event.identity as any;
    const {username} = identity;

    if (!username) {
        throw new Error("User profile data missing");
    }

    const command = new AdminGetUserCommand({
        UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
        Username: username,
    })
    const { UserAttributes } = await client.send(command)

    const email = UserAttributes?.find(a => a.Name === 'email')?.Value || ''

    const groupResponse = await client.send(new AdminListGroupsForUserCommand({
        UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
        Username: username,
    }))
    const groups = (groupResponse.Groups || []).map(g => g.GroupName)

    return {
        username,
        email,
        groups
    } as any
}
