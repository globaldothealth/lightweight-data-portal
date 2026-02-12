/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createDownloadEvent = /* GraphQL */ `mutation CreateDownloadEvent(
  $condition: ModelDownloadEventConditionInput
  $input: CreateDownloadEventInput!
) {
  createDownloadEvent(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateDownloadEventMutationVariables,
  APITypes.CreateDownloadEventMutation
>;
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
export const deleteDownloadEvent = /* GraphQL */ `mutation DeleteDownloadEvent(
  $condition: ModelDownloadEventConditionInput
  $input: DeleteDownloadEventInput!
) {
  deleteDownloadEvent(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteDownloadEventMutationVariables,
  APITypes.DeleteDownloadEventMutation
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
export const updateDownloadEvent = /* GraphQL */ `mutation UpdateDownloadEvent(
  $condition: ModelDownloadEventConditionInput
  $input: UpdateDownloadEventInput!
) {
  updateDownloadEvent(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateDownloadEventMutationVariables,
  APITypes.UpdateDownloadEventMutation
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
