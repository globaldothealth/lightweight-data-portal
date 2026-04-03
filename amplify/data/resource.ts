import {type ClientSchema, a, defineData} from "@aws-amplify/backend";
import {postConfirmation} from "../auth/post-confirmation/resource";
import {postAuthentication} from "../auth/post-authentication/resource";
import {addUserToGroup} from "./add-user-to-group/resource";
import {removeUserFromGroup} from "./remove-user-from-group/resource";
import {deleteUser} from "./delete-user/resource";
import {getUsers} from "./get-users/resource";
import {getUserProfile} from "./get-user-profile/resource";


const schema = a
    .schema({
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
        addUserToGroup: a
            .mutation()
            .arguments({
                userId: a.string().required(),
                groupName: a.string().required(),
            })
            .authorization((allow) => [allow.group("ADMINS")])
            .handler(a.handler.function(addUserToGroup))
            .returns(a.json()),
        removeUserFromGroup: a
            .mutation()
            .arguments({
                userId: a.string().required(),
                groupName: a.string().required(),
            })
            .authorization((allow) => [allow.group("ADMINS")])
            .handler(a.handler.function(removeUserFromGroup))
            .returns(a.json()),
        deleteUser: a
            .mutation()
            .arguments({
                userId: a.string().required(),
            })
            .authorization((allow) => [allow.group("ADMINS")])
            .handler(a.handler.function(deleteUser))
            .returns(a.json()),
        getUsers: a
            .query()
            .arguments({})
            .authorization((allow) => [allow.group("ADMINS")])
            .handler(a.handler.function(getUsers))
            .returns(a.json()),
        getUserProfile: a
            .query()
            .arguments({})
            .authorization((allow) => [allow.authenticated()])
            .handler(a.handler.function(getUserProfile))
            .returns(a.json()),
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