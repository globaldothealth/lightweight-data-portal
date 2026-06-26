import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { Group } from './auth/groups';
import { data } from './data/resource';
import { PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import {
  DockerImageFunction,
  DockerImageCode,
  Runtime,
  StartingPosition,
  EventSourceMapping,
} from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { StreamViewType } from 'aws-cdk-lib/aws-dynamodb';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';
import { Duration } from 'aws-cdk-lib';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { OUTBREAK_CONFIGS } from '../src/config/outbreaks';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
});

const ghOutbreakData = 'gh-outbreak-data';
const ghDataDownloadsBucketName = 'gh-data-downloads';
const globalDengueForecastingBucketName = 'global-dengue-forecasting';
const aggregatedMapDataBucketName = 'aggregated-map-data';

backend.auth.resources.authenticatedUserIamRole.addToPrincipalPolicy(
  new PolicyStatement({
    actions: ['s3:GetObject', 's3:ListBucket'],
    resources: [`arn:aws:s3:::${ghOutbreakData}`, `arn:aws:s3:::${ghOutbreakData}/*`],
  })
);

backend.auth.resources.groups[Group.Admin].role.addToPrincipalPolicy(
  new PolicyStatement({
    actions: [
      'cognito-idp:ListUsers',
      'cognito-idp:AdminListGroupsForUser',
      'cognito-idp:AdminAddUserToGroup',
      'cognito-idp:AdminRemoveUserFromGroup',
      'cognito-idp:AdminDeleteUser',
    ],
    resources: [backend.auth.resources.userPool.userPoolArn],
  })
);

[Group.Admin, Group.Curator, Group.Researcher].forEach(group => {
    backend.auth.resources.groups[group].role.addToPrincipalPolicy(
        new PolicyStatement({
            actions: ['s3:GetObject', 's3:ListBucket'],
            resources: [`arn:aws:s3:::${ghOutbreakData}`, `arn:aws:s3:::${ghOutbreakData}/*`],
        })
    );
    backend.auth.resources.groups[group].role.addToPrincipalPolicy(
        new PolicyStatement({
            actions: ['s3:GetObject', 's3:ListBucket'],
            resources: [`arn:aws:s3:::${ghDataDownloadsBucketName}`, `arn:aws:s3:::${ghDataDownloadsBucketName}/*`],
        })
    );
    backend.auth.resources.groups[group].role.addToPrincipalPolicy(
        new PolicyStatement({
            actions: ['s3:GetObject', 's3:ListBucket'],
            resources: [`arn:aws:s3:::${globalDengueForecastingBucketName}`, `arn:aws:s3:::${globalDengueForecastingBucketName}/*`],
        })
    );
});

backend.addOutput({
  storage: {
    buckets: [
      {
        name: ghDataDownloadsBucketName,
        bucket_name: ghDataDownloadsBucketName,
        aws_region: backend.auth.resources.userPool.stack.region,
      },
      {
        name: ghOutbreakData,
        bucket_name: ghOutbreakData,
        aws_region: backend.auth.resources.userPool.stack.region,
      },
      {
        name: globalDengueForecastingBucketName,
        bucket_name: globalDengueForecastingBucketName,
        aws_region: backend.auth.resources.userPool.stack.region,
      },
      {
        name: aggregatedMapDataBucketName,
        bucket_name: aggregatedMapDataBucketName,
        aws_region: backend.auth.resources.userPool.stack.region,
      }
    ]
  }
});

// --- Map Data Aggregation Lambda (Docker/Python) ---
const mapDataAggregationStack = backend.createStack('MapDataAggregationStack');

const mapDataAggregationFn = new DockerImageFunction(mapDataAggregationStack, 'MapDataAggregationFn', {
  code: DockerImageCode.fromImageAsset(
    path.join(__dirname, 'custom/map-data-aggregation'),
    { platform: Platform.LINUX_AMD64 }
  ),
  memorySize: 1024,
  timeout: Duration.minutes(5),
  environment: {
    BUCKET_NAME: aggregatedMapDataBucketName,
    OUTBREAK_CONFIGS: JSON.stringify(OUTBREAK_CONFIGS),
  },
});

// Grant the Lambda read/write access to the aggregated-map-data bucket
mapDataAggregationFn.addToRolePolicy(
  new PolicyStatement({
    actions: ['s3:GetObject', 's3:PutObject', 's3:ListBucket'],
    resources: [
      `arn:aws:s3:::${aggregatedMapDataBucketName}`,
      `arn:aws:s3:::${aggregatedMapDataBucketName}/*`,
    ],
  })
);

// --- Dynamic, user-driven schedules ---
// Schedules are no longer hard-coded here. Instead, EventBridge Scheduler
// schedules are created/updated/deleted at runtime from the `ScheduleConfig`
// records that admins manage through the UI. A DynamoDB stream on that table
// invokes the `schedule-manager` Lambda, which provisions the actual schedules.

// Role that EventBridge Scheduler assumes to invoke the aggregation Lambda.
const aggregationSchedulerRole = new Role(mapDataAggregationStack, 'AggregationSchedulerInvokeRole', {
  assumedBy: new ServicePrincipal('scheduler.amazonaws.com'),
  description: 'Assumed by EventBridge Scheduler to invoke the map data aggregation Lambda',
});
mapDataAggregationFn.grantInvoke(aggregationSchedulerRole);

// Lambda that reconciles ScheduleConfig records with EventBridge Scheduler schedules.
const scheduleManagerFn = new NodejsFunction(mapDataAggregationStack, 'ScheduleManagerFn', {
  entry: path.join(__dirname, 'functions/schedule-manager/handler.ts'),
  runtime: Runtime.NODEJS_20_X,
  timeout: Duration.seconds(60),
  environment: {
    AGGREGATION_FUNCTION_ARN: mapDataAggregationFn.functionArn,
    SCHEDULER_ROLE_ARN: aggregationSchedulerRole.roleArn,
  },
});

// Allow the manager to create/update/delete the per-config schedules and to pass
// the scheduler role to EventBridge Scheduler.
scheduleManagerFn.addToRolePolicy(
  new PolicyStatement({
    actions: [
      'scheduler:CreateSchedule',
      'scheduler:UpdateSchedule',
      'scheduler:DeleteSchedule',
      'scheduler:GetSchedule',
    ],
    resources: ['arn:aws:scheduler:*:*:schedule/default/aggregation-*'],
  })
);
scheduleManagerFn.addToRolePolicy(
  new PolicyStatement({
    actions: ['iam:PassRole'],
    resources: [aggregationSchedulerRole.roleArn],
    conditions: { StringEquals: { 'iam:PassedToService': 'scheduler.amazonaws.com' } },
  })
);

// Enable a DynamoDB stream on the ScheduleConfig table and feed it to the manager.
const scheduleConfigCfnTable = backend.data.resources.cfnResources.amplifyDynamoDbTables['ScheduleConfig'];
scheduleConfigCfnTable.streamSpecification = {
  streamViewType: StreamViewType.NEW_AND_OLD_IMAGES,
};

const scheduleConfigStreamArn = scheduleConfigCfnTable.attrStreamArn;

scheduleManagerFn.addToRolePolicy(
  new PolicyStatement({
    actions: [
      'dynamodb:DescribeStream',
      'dynamodb:GetRecords',
      'dynamodb:GetShardIterator',
      'dynamodb:ListStreams',
    ],
    resources: [scheduleConfigStreamArn],
  })
);

new EventSourceMapping(mapDataAggregationStack, 'ScheduleManagerStreamMapping', {
  target: scheduleManagerFn,
  eventSourceArn: scheduleConfigStreamArn,
  startingPosition: StartingPosition.LATEST,
  batchSize: 5,
  retryAttempts: 3,
});

