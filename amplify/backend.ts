import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { Group } from './auth/groups';
import { data } from './data/resource';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { DockerImageFunction, DockerImageCode } from 'aws-cdk-lib/aws-lambda';
import { Platform } from 'aws-cdk-lib/aws-ecr-assets';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Duration } from 'aws-cdk-lib';
import * as path from 'path';
import { fileURLToPath } from 'url';

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
    TARGET_FILE_KEY: 'parsed_data.json',
    MISSING_FILE_KEY: 'missing_data.json',
    DATA_URL: 'https://raw.githubusercontent.com/globaldothealth/outbreak-data/refs/heads/main/Ebola%20BVD/Data/Ebola%20BVD%202026%20linelist%20-%20PUBLIC%20VIEW.csv',
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

// Schedule: every 12 hours
new Rule(mapDataAggregationStack, 'Every12HoursAggregationRule', {
  schedule: Schedule.rate(Duration.hours(12)),
  targets: [new LambdaFunction(mapDataAggregationFn)],
});

