/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getDownloadEvent = /* GraphQL */ `query GetDownloadEvent($id: ID!) {
  getDownloadEvent(id: $id) {
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
` as GeneratedQuery<
  APITypes.GetDownloadEventQueryVariables,
  APITypes.GetDownloadEventQuery
>;
export const getSignInEvent = /* GraphQL */ `query GetSignInEvent($id: ID!) {
  getSignInEvent(id: $id) {
    createdAt
    email
    id
    timestamp
    updatedAt
    userId
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetSignInEventQueryVariables,
  APITypes.GetSignInEventQuery
>;
export const listDownloadEvents = /* GraphQL */ `query ListDownloadEvents(
  $filter: ModelDownloadEventFilterInput
  $limit: Int
  $nextToken: String
) {
  listDownloadEvents(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      createdAt
      email
      filename
      id
      timestamp
      updatedAt
      userId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListDownloadEventsQueryVariables,
  APITypes.ListDownloadEventsQuery
>;
export const listSignInEvents = /* GraphQL */ `query ListSignInEvents(
  $filter: ModelSignInEventFilterInput
  $limit: Int
  $nextToken: String
) {
  listSignInEvents(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      createdAt
      email
      id
      timestamp
      updatedAt
      userId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListSignInEventsQueryVariables,
  APITypes.ListSignInEventsQuery
>;
