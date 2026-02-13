/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type DownloadEvent = {
  __typename: "DownloadEvent",
  createdAt: string,
  email?: string | null,
  filename?: string | null,
  id: string,
  timestamp?: string | null,
  updatedAt: string,
  userId?: string | null,
};

export type SignInEvent = {
  __typename: "SignInEvent",
  createdAt: string,
  email?: string | null,
  id: string,
  timestamp?: string | null,
  updatedAt: string,
  userId?: string | null,
};

export type ModelDownloadEventFilterInput = {
  and?: Array< ModelDownloadEventFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  email?: ModelStringInput | null,
  filename?: ModelStringInput | null,
  id?: ModelIDInput | null,
  not?: ModelDownloadEventFilterInput | null,
  or?: Array< ModelDownloadEventFilterInput | null > | null,
  timestamp?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  userId?: ModelStringInput | null,
};

export type ModelStringInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  _null = "_null",
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
}


export type ModelSizeInput = {
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
};

export type ModelIDInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  size?: ModelSizeInput | null,
};

export type ModelDownloadEventConnection = {
  __typename: "ModelDownloadEventConnection",
  items:  Array<DownloadEvent | null >,
  nextToken?: string | null,
};

export type ModelSignInEventFilterInput = {
  and?: Array< ModelSignInEventFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  email?: ModelStringInput | null,
  id?: ModelIDInput | null,
  not?: ModelSignInEventFilterInput | null,
  or?: Array< ModelSignInEventFilterInput | null > | null,
  timestamp?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  userId?: ModelStringInput | null,
};

export type ModelSignInEventConnection = {
  __typename: "ModelSignInEventConnection",
  items:  Array<SignInEvent | null >,
  nextToken?: string | null,
};

export type ModelDownloadEventConditionInput = {
  and?: Array< ModelDownloadEventConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  email?: ModelStringInput | null,
  filename?: ModelStringInput | null,
  not?: ModelDownloadEventConditionInput | null,
  or?: Array< ModelDownloadEventConditionInput | null > | null,
  timestamp?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  userId?: ModelStringInput | null,
};

export type CreateDownloadEventInput = {
  email?: string | null,
  filename?: string | null,
  id?: string | null,
  timestamp?: string | null,
  userId?: string | null,
};

export type ModelSignInEventConditionInput = {
  and?: Array< ModelSignInEventConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  email?: ModelStringInput | null,
  not?: ModelSignInEventConditionInput | null,
  or?: Array< ModelSignInEventConditionInput | null > | null,
  timestamp?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  userId?: ModelStringInput | null,
};

export type CreateSignInEventInput = {
  email?: string | null,
  id?: string | null,
  timestamp?: string | null,
  userId?: string | null,
};

export type DeleteDownloadEventInput = {
  id: string,
};

export type DeleteSignInEventInput = {
  id: string,
};

export type UpdateDownloadEventInput = {
  email?: string | null,
  filename?: string | null,
  id: string,
  timestamp?: string | null,
  userId?: string | null,
};

export type UpdateSignInEventInput = {
  email?: string | null,
  id: string,
  timestamp?: string | null,
  userId?: string | null,
};

export type ModelSubscriptionDownloadEventFilterInput = {
  and?: Array< ModelSubscriptionDownloadEventFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  email?: ModelSubscriptionStringInput | null,
  filename?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionDownloadEventFilterInput | null > | null,
  timestamp?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  userId?: ModelStringInput | null,
};

export type ModelSubscriptionStringInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  in?: Array< string | null > | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionIDInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  in?: Array< string | null > | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionSignInEventFilterInput = {
  and?: Array< ModelSubscriptionSignInEventFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  email?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionSignInEventFilterInput | null > | null,
  timestamp?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  userId?: ModelStringInput | null,
};

export type GetDownloadEventQueryVariables = {
  id: string,
};

export type GetDownloadEventQuery = {
  getDownloadEvent?:  {
    __typename: "DownloadEvent",
    createdAt: string,
    email?: string | null,
    filename?: string | null,
    id: string,
    timestamp?: string | null,
    updatedAt: string,
    userId?: string | null,
  } | null,
};

export type GetSignInEventQueryVariables = {
  id: string,
};

export type GetSignInEventQuery = {
  getSignInEvent?:  {
    __typename: "SignInEvent",
    createdAt: string,
    email?: string | null,
    id: string,
    timestamp?: string | null,
    updatedAt: string,
    userId?: string | null,
  } | null,
};

export type ListDownloadEventsQueryVariables = {
  filter?: ModelDownloadEventFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListDownloadEventsQuery = {
  listDownloadEvents?:  {
    __typename: "ModelDownloadEventConnection",
    items:  Array< {
      __typename: "DownloadEvent",
      createdAt: string,
      email?: string | null,
      filename?: string | null,
      id: string,
      timestamp?: string | null,
      updatedAt: string,
      userId?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListSignInEventsQueryVariables = {
  filter?: ModelSignInEventFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListSignInEventsQuery = {
  listSignInEvents?:  {
    __typename: "ModelSignInEventConnection",
    items:  Array< {
      __typename: "SignInEvent",
      createdAt: string,
      email?: string | null,
      id: string,
      timestamp?: string | null,
      updatedAt: string,
      userId?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type CreateDownloadEventMutationVariables = {
  condition?: ModelDownloadEventConditionInput | null,
  input: CreateDownloadEventInput,
};

export type CreateDownloadEventMutation = {
  createDownloadEvent?:  {
    __typename: "DownloadEvent",
    createdAt: string,
    email?: string | null,
    filename?: string | null,
    id: string,
    timestamp?: string | null,
    updatedAt: string,
    userId?: string | null,
  } | null,
};

export type CreateSignInEventMutationVariables = {
  condition?: ModelSignInEventConditionInput | null,
  input: CreateSignInEventInput,
};

export type CreateSignInEventMutation = {
  createSignInEvent?:  {
    __typename: "SignInEvent",
    createdAt: string,
    email?: string | null,
    id: string,
    timestamp?: string | null,
    updatedAt: string,
    userId?: string | null,
  } | null,
};

export type DeleteDownloadEventMutationVariables = {
  condition?: ModelDownloadEventConditionInput | null,
  input: DeleteDownloadEventInput,
};

export type DeleteDownloadEventMutation = {
  deleteDownloadEvent?:  {
    __typename: "DownloadEvent",
    createdAt: string,
    email?: string | null,
    filename?: string | null,
    id: string,
    timestamp?: string | null,
    updatedAt: string,
    userId?: string | null,
  } | null,
};

export type DeleteSignInEventMutationVariables = {
  condition?: ModelSignInEventConditionInput | null,
  input: DeleteSignInEventInput,
};

export type DeleteSignInEventMutation = {
  deleteSignInEvent?:  {
    __typename: "SignInEvent",
    createdAt: string,
    email?: string | null,
    id: string,
    timestamp?: string | null,
    updatedAt: string,
    userId?: string | null,
  } | null,
};

export type UpdateDownloadEventMutationVariables = {
  condition?: ModelDownloadEventConditionInput | null,
  input: UpdateDownloadEventInput,
};

export type UpdateDownloadEventMutation = {
  updateDownloadEvent?:  {
    __typename: "DownloadEvent",
    createdAt: string,
    email?: string | null,
    filename?: string | null,
    id: string,
    timestamp?: string | null,
    updatedAt: string,
    userId?: string | null,
  } | null,
};

export type UpdateSignInEventMutationVariables = {
  condition?: ModelSignInEventConditionInput | null,
  input: UpdateSignInEventInput,
};

export type UpdateSignInEventMutation = {
  updateSignInEvent?:  {
    __typename: "SignInEvent",
    createdAt: string,
    email?: string | null,
    id: string,
    timestamp?: string | null,
    updatedAt: string,
    userId?: string | null,
  } | null,
};

export type OnCreateDownloadEventSubscriptionVariables = {
  filter?: ModelSubscriptionDownloadEventFilterInput | null,
  userId?: string | null,
};

export type OnCreateDownloadEventSubscription = {
  onCreateDownloadEvent?:  {
    __typename: "DownloadEvent",
    createdAt: string,
    email?: string | null,
    filename?: string | null,
    id: string,
    timestamp?: string | null,
    updatedAt: string,
    userId?: string | null,
  } | null,
};

export type OnCreateSignInEventSubscriptionVariables = {
  filter?: ModelSubscriptionSignInEventFilterInput | null,
  userId?: string | null,
};

export type OnCreateSignInEventSubscription = {
  onCreateSignInEvent?:  {
    __typename: "SignInEvent",
    createdAt: string,
    email?: string | null,
    id: string,
    timestamp?: string | null,
    updatedAt: string,
    userId?: string | null,
  } | null,
};

export type OnDeleteDownloadEventSubscriptionVariables = {
  filter?: ModelSubscriptionDownloadEventFilterInput | null,
  userId?: string | null,
};

export type OnDeleteDownloadEventSubscription = {
  onDeleteDownloadEvent?:  {
    __typename: "DownloadEvent",
    createdAt: string,
    email?: string | null,
    filename?: string | null,
    id: string,
    timestamp?: string | null,
    updatedAt: string,
    userId?: string | null,
  } | null,
};

export type OnDeleteSignInEventSubscriptionVariables = {
  filter?: ModelSubscriptionSignInEventFilterInput | null,
  userId?: string | null,
};

export type OnDeleteSignInEventSubscription = {
  onDeleteSignInEvent?:  {
    __typename: "SignInEvent",
    createdAt: string,
    email?: string | null,
    id: string,
    timestamp?: string | null,
    updatedAt: string,
    userId?: string | null,
  } | null,
};

export type OnUpdateDownloadEventSubscriptionVariables = {
  filter?: ModelSubscriptionDownloadEventFilterInput | null,
  userId?: string | null,
};

export type OnUpdateDownloadEventSubscription = {
  onUpdateDownloadEvent?:  {
    __typename: "DownloadEvent",
    createdAt: string,
    email?: string | null,
    filename?: string | null,
    id: string,
    timestamp?: string | null,
    updatedAt: string,
    userId?: string | null,
  } | null,
};

export type OnUpdateSignInEventSubscriptionVariables = {
  filter?: ModelSubscriptionSignInEventFilterInput | null,
  userId?: string | null,
};

export type OnUpdateSignInEventSubscription = {
  onUpdateSignInEvent?:  {
    __typename: "SignInEvent",
    createdAt: string,
    email?: string | null,
    id: string,
    timestamp?: string | null,
    updatedAt: string,
    userId?: string | null,
  } | null,
};
