/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

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
export const onCreateUserProfile = /* GraphQL */ `subscription OnCreateUserProfile(
  $filter: ModelSubscriptionUserProfileFilterInput
  $profileOwner: String
) {
  onCreateUserProfile(filter: $filter, profileOwner: $profileOwner) {
    createdAt
    email
    id
    profileOwner
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnCreateUserProfileSubscriptionVariables,
  APITypes.OnCreateUserProfileSubscription
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
export const onDeleteUserProfile = /* GraphQL */ `subscription OnDeleteUserProfile(
  $filter: ModelSubscriptionUserProfileFilterInput
  $profileOwner: String
) {
  onDeleteUserProfile(filter: $filter, profileOwner: $profileOwner) {
    createdAt
    email
    id
    profileOwner
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnDeleteUserProfileSubscriptionVariables,
  APITypes.OnDeleteUserProfileSubscription
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
export const onUpdateUserProfile = /* GraphQL */ `subscription OnUpdateUserProfile(
  $filter: ModelSubscriptionUserProfileFilterInput
  $profileOwner: String
) {
  onUpdateUserProfile(filter: $filter, profileOwner: $profileOwner) {
    createdAt
    email
    id
    profileOwner
    updatedAt
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnUpdateUserProfileSubscriptionVariables,
  APITypes.OnUpdateUserProfileSubscription
>;
