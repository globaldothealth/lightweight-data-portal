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
            'PENDING_VERIFICATION',
            'VERIFIED',
        ]),
        // A source is one URL; its record id is a UUIDv5 of the normalized URL.
        // The PDFs and their verification belong to Snapshot.
        Source: a
            .model({
                url: a.string().required(),
                outbreakName: a.string().required(),
                downloadedAt: a.string(),
                errorMessage: a.string(),
            })
            .secondaryIndexes((index) => [
                index('outbreakName').queryField('listSourcesByOutbreak'),
                index('url').queryField('listSourcesByUrl'),
            ])
            .authorization((allow) => [
                allow.groups([Group.Admin, Group.Curator]),
                allow.authenticated().to(['read']),
            ]),
        // The content of a source at one point in time: one PDF per capture date, verified individually.
        // id = `${sourceId}_${capturedAt}` (so a date can only be added once per source) and the file is
        // s3://gh-outbreak-sources/<outbreakName>/<sourceId>/<capturedAt>.pdf
        Snapshot: a
            .model({
                sourceId: a.string().required(),
                outbreakName: a.string().required(),
                capturedAt: a.string().required(), // YYYY-MM-DD (UTC)
                status: a.ref('SourceStatus').required(),
                verifiedBy: a.string(),
                verifiedAt: a.string(),
            })
            .secondaryIndexes((index) => [
                index('outbreakName').sortKeys(['status']).queryField('listSnapshotsByOutbreakAndStatus'),
                index('sourceId').sortKeys(['capturedAt']).queryField('listSnapshotsBySource'),
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