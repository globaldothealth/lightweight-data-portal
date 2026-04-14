import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { Group } from './auth/groups';
import { data } from './data/resource';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

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
      }
    ]
  }
});
