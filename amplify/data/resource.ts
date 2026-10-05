import {type ClientSchema, a, defineData} from "@aws-amplify/backend";
import {postConfirmation} from "../auth/post-confirmation/resource";
import {postAuthentication} from "../auth/post-authentication/resource";
import {addUserToGroup} from "./add-user-to-group/resource";
import {removeUserFromGroup} from "./remove-user-from-group/resource";
import {deleteUser} from "./delete-user/resource";
import {getUsers} from "./get-users/resource";
import {getUserProfile} from "./get-user-profile/resource";
import {Group} from "../auth/groups";


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
        ScheduleConfig: a
            .model({
                scheduleExpression: a.string().required(),
                outbreakName: a.string().required(),
                enabled: a.boolean().required(),
            })
            .authorization((allow) => [
                allow.group(Group.Admin),
            ]),
        SourceStatus: a.enum([
            'PENDING_DOWNLOAD',
            'DOWNLOAD_FAILED',
            'PENDING_VERIFICATION',
            'VERIFIED',
        ]),
        // The record id is a UUIDv5 of the normalized source URL and doubles as the S3 file name:
        // s3://gh-outbreak-sources/<outbreakName>/<id>.pdf
        Source: a
            .model({
                url: a.string().required(),
                outbreakName: a.string().required(),
                status: a.ref('SourceStatus').required(),
                downloadedAt: a.string(),
                verifiedBy: a.string(),
                verifiedAt: a.string(),
                errorMessage: a.string(),
            })
            .secondaryIndexes((index) => [
                index('outbreakName').sortKeys(['status']).queryField('listSourcesByOutbreakAndStatus'),
                index('url').queryField('listSourcesByUrl'),
            ])
            .authorization((allow) => [
                allow.groups([Group.Admin, Group.Curator]),
                allow.authenticated().to(['read']),
            ]),
        addUserToGroup: a
            .mutation()
            .arguments({
                username: a.string().required(),
                groupName: a.string().required(),
            })
            .authorization((allow) => [allow.group(Group.Admin)])
            .handler(a.handler.function(addUserToGroup))
            .returns(a.json()),
        removeUserFromGroup: a
            .mutation()
            .arguments({
                username: a.string().required(),
                groupName: a.string().required(),
            })
            .authorization((allow) => [allow.group(Group.Admin)])
            .handler(a.handler.function(removeUserFromGroup))
            .returns(a.json()),
        deleteUser: a
            .mutation()
            .arguments({
                username: a.string().required(),
            })
            .authorization((allow) => [allow.group(Group.Admin)])
            .handler(a.handler.function(deleteUser))
            .returns(a.json()),
        getUsers: a
            .query()
            .arguments({})
            .authorization((allow) => [allow.group(Group.Admin)])
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
        defaultAuthorizationMode: "userPool",
    },
});