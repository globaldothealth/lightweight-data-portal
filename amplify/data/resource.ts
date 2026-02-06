import {type ClientSchema, a, defineData} from "@aws-amplify/backend";
import {postConfirmation} from "../auth/post-confirmation/resource";
import {postAuthentication} from "../auth/post-authentication/resource";

const schema = a
    .schema({
        UserProfile: a
            .model({
                email: a.string(),
                profileOwner: a.string(),
            })
            .authorization((allow) => [
                allow.ownerDefinedIn("profileOwner"),
            ]),
        SignInEvent: a
            .model({
                userId: a.string(),
                email: a.string(),
                timestamp: a.string(),
            })
            .authorization((allow) => [
                allow.ownerDefinedIn("userId"),
            ]),
        DownloadEvent: a
            .model({
                userId: a.string(),
                email: a.string(),
                filename: a.string(),
                timestamp: a.string(),
            })
            .authorization((allow) => [
                allow.ownerDefinedIn("userId"),
            ]),
    })
    .authorization((allow) => [allow.resource(postConfirmation), allow.resource(postAuthentication)]);
export type Schema = ClientSchema<typeof schema>;
export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: "apiKey",
        apiKeyAuthorizationMode: {
            expiresInDays: 30,
        },
    },
});