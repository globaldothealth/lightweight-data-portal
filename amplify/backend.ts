import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  storage,
});

const ghDataDownloadsBucketName = 'gh-data-downloads';
const globalDengueForecastingBucketName = 'global-dengue-forecasting';

backend.auth.resources.authenticatedUserIamRole.addToPrincipalPolicy(
  new PolicyStatement({
    actions: ['s3:GetObject', 's3:ListBucket'],
    resources: [`arn:aws:s3:::${ghDataDownloadsBucketName}`, `arn:aws:s3:::${ghDataDownloadsBucketName}/*`],
  })
);

backend.auth.resources.authenticatedUserIamRole.addToPrincipalPolicy(
  new PolicyStatement({
    actions: ['s3:GetObject', 's3:ListBucket'],
    resources: [`arn:aws:s3:::${globalDengueForecastingBucketName}`, `arn:aws:s3:::${globalDengueForecastingBucketName}/*`],
  })
);

backend.addOutput({
  storage: {
    buckets: [
      {
        name: ghDataDownloadsBucketName,
        bucket_name: ghDataDownloadsBucketName,
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
