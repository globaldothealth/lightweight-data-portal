/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createSignInEvent = /* GraphQL */ `mutation CreateSignInEvent(
  $condition: ModelSignInEventConditionInput
  $input: CreateSignInEventInput!
) {
  createSignInEvent(condition: $condition, input: $input) {
    createdAt
    email
    id
    timestamp
    updatedAt
    userId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateSignInEventMutationVariables,
  APITypes.CreateSignInEventMutation
>;
export const createUserProfile = /* GraphQL */ `mutation CreateUserProfile(
  $condition: ModelUserProfileConditionInput
  $input: CreateUserProfileInput!
) {
  createUserProfile(condition: $condition, input: $input) {
    createdAt
    email
    id
    profileOwner
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateUserProfileMutationVariables,
  APITypes.CreateUserProfileMutation
>;
export const deleteSignInEvent = /* GraphQL */ `mutation DeleteSignInEvent(
  $condition: ModelSignInEventConditionInput
  $input: DeleteSignInEventInput!
) {
  deleteSignInEvent(condition: $condition, input: $input) {
    createdAt
    email
    id
    timestamp
    updatedAt
    userId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteSignInEventMutationVariables,
  APITypes.DeleteSignInEventMutation
>;
export const deleteUserProfile = /* GraphQL */ `mutation DeleteUserProfile(
  $condition: ModelUserProfileConditionInput
  $input: DeleteUserProfileInput!
) {
  deleteUserProfile(condition: $condition, input: $input) {
    createdAt
    email
    id
    profileOwner
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteUserProfileMutationVariables,
  APITypes.DeleteUserProfileMutation
>;
export const updateSignInEvent = /* GraphQL */ `mutation UpdateSignInEvent(
  $condition: ModelSignInEventConditionInput
  $input: UpdateSignInEventInput!
) {
  updateSignInEvent(condition: $condition, input: $input) {
    createdAt
    email
    id
    timestamp
    updatedAt
    userId
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateSignInEventMutationVariables,
  APITypes.UpdateSignInEventMutation
>;
export const updateUserProfile = /* GraphQL */ `mutation UpdateUserProfile(
  $condition: ModelUserProfileConditionInput
  $input: UpdateUserProfileInput!
) {
  updateUserProfile(condition: $condition, input: $input) {
    createdAt
    email
    id
    profileOwner
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateUserProfileMutationVariables,
  APITypes.UpdateUserProfileMutation
>;
