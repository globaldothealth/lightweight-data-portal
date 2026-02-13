/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateDownloadEvent = /* GraphQL */ `subscription OnCreateDownloadEvent(
  $filter: ModelSubscriptionDownloadEventFilterInput
  $userId: String
) {
  onCreateDownloadEvent(filter: $filter, userId: $userId) {
    createdAt
    email
    filename
    id
    timestamp
    updatedAt
    userId
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateDownloadEventSubscriptionVariables,
  APITypes.OnCreateDownloadEventSubscription
>;
export const onCreateSignInEvent = /* GraphQL */ `subscription OnCreateSignInEvent(
  $filter: ModelSubscriptionSignInEventFilterInput
  $userId: String
) {
  onCreateSignInEvent(filter: $filter, userId: $userId) {
    createdAt
    email
    id
    timestamp
    updatedAt
    userId
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateSignInEventSubscriptionVariables,
  APITypes.OnCreateSignInEventSubscription
>;
export const onDeleteDownloadEvent = /* GraphQL */ `subscription OnDeleteDownloadEvent(
  $filter: ModelSubscriptionDownloadEventFilterInput
  $userId: String
) {
  onDeleteDownloadEvent(filter: $filter, userId: $userId) {
    createdAt
    email
    filename
    id
    timestamp
    updatedAt
    userId
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteDownloadEventSubscriptionVariables,
  APITypes.OnDeleteDownloadEventSubscription
>;
export const onDeleteSignInEvent = /* GraphQL */ `subscription OnDeleteSignInEvent(
  $filter: ModelSubscriptionSignInEventFilterInput
  $userId: String
) {
  onDeleteSignInEvent(filter: $filter, userId: $userId) {
    createdAt
    email
    id
    timestamp
    updatedAt
    userId
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteSignInEventSubscriptionVariables,
  APITypes.OnDeleteSignInEventSubscription
>;
export const onUpdateDownloadEvent = /* GraphQL */ `subscription OnUpdateDownloadEvent(
  $filter: ModelSubscriptionDownloadEventFilterInput
  $userId: String
) {
  onUpdateDownloadEvent(filter: $filter, userId: $userId) {
    createdAt
    email
    filename
    id
    timestamp
    updatedAt
    userId
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateDownloadEventSubscriptionVariables,
  APITypes.OnUpdateDownloadEventSubscription
>;
export const onUpdateSignInEvent = /* GraphQL */ `subscription OnUpdateSignInEvent(
  $filter: ModelSubscriptionSignInEventFilterInput
  $userId: String
) {
  onUpdateSignInEvent(filter: $filter, userId: $userId) {
    createdAt
    email
    id
    timestamp
    updatedAt
    userId
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateSignInEventSubscriptionVariables,
  APITypes.OnUpdateSignInEventSubscription
>;
