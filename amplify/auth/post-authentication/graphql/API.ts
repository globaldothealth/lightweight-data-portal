/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type SignInEvent = {
  __typename: "SignInEvent",
  createdAt: string,
  email?: string | null,
  id: string,
  timestamp?: string | null,
  updatedAt: string,
  userId?: string | null,
};

export type UserProfile = {
  __typename: "UserProfile",
  createdAt: string,
  email?: string | null,
  id: string,
  profileOwner?: string | null,
  updatedAt: string,
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

export type ModelSignInEventConnection = {
  __typename: "ModelSignInEventConnection",
  items:  Array<SignInEvent | null >,
  nextToken?: string | null,
};

export type ModelUserProfileFilterInput = {
  and?: Array< ModelUserProfileFilterInput | null > | null,
  createdAt?: ModelStringInput | null,
  email?: ModelStringInput | null,
  id?: ModelIDInput | null,
  not?: ModelUserProfileFilterInput | null,
  or?: Array< ModelUserProfileFilterInput | null > | null,
  profileOwner?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelUserProfileConnection = {
  __typename: "ModelUserProfileConnection",
  items:  Array<UserProfile | null >,
  nextToken?: string | null,
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

export type ModelUserProfileConditionInput = {
  and?: Array< ModelUserProfileConditionInput | null > | null,
  createdAt?: ModelStringInput | null,
  email?: ModelStringInput | null,
  not?: ModelUserProfileConditionInput | null,
  or?: Array< ModelUserProfileConditionInput | null > | null,
  profileOwner?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateUserProfileInput = {
  email?: string | null,
  id?: string | null,
  profileOwner?: string | null,
};

export type DeleteSignInEventInput = {
  id: string,
};

export type DeleteUserProfileInput = {
  id: string,
};

export type UpdateSignInEventInput = {
  email?: string | null,
  id: string,
  timestamp?: string | null,
  userId?: string | null,
};

export type UpdateUserProfileInput = {
  email?: string | null,
  id: string,
  profileOwner?: string | null,
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

export type ModelSubscriptionUserProfileFilterInput = {
  and?: Array< ModelSubscriptionUserProfileFilterInput | null > | null,
  createdAt?: ModelSubscriptionStringInput | null,
  email?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionUserProfileFilterInput | null > | null,
  profileOwner?: ModelStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
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

export type GetUserProfileQueryVariables = {
  id: string,
};

export type GetUserProfileQuery = {
  getUserProfile?:  {
    __typename: "UserProfile",
    createdAt: string,
    email?: string | null,
    id: string,
    profileOwner?: string | null,
    updatedAt: string,
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

export type ListUserProfilesQueryVariables = {
  filter?: ModelUserProfileFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListUserProfilesQuery = {
  listUserProfiles?:  {
    __typename: "ModelUserProfileConnection",
    items:  Array< {
      __typename: "UserProfile",
      createdAt: string,
      email?: string | null,
      id: string,
      profileOwner?: string | null,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
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

export type CreateUserProfileMutationVariables = {
  condition?: ModelUserProfileConditionInput | null,
  input: CreateUserProfileInput,
};

export type CreateUserProfileMutation = {
  createUserProfile?:  {
    __typename: "UserProfile",
    createdAt: string,
    email?: string | null,
    id: string,
    profileOwner?: string | null,
    updatedAt: string,
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

export type DeleteUserProfileMutationVariables = {
  condition?: ModelUserProfileConditionInput | null,
  input: DeleteUserProfileInput,
};

export type DeleteUserProfileMutation = {
  deleteUserProfile?:  {
    __typename: "UserProfile",
    createdAt: string,
    email?: string | null,
    id: string,
    profileOwner?: string | null,
    updatedAt: string,
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

export type UpdateUserProfileMutationVariables = {
  condition?: ModelUserProfileConditionInput | null,
  input: UpdateUserProfileInput,
};

export type UpdateUserProfileMutation = {
  updateUserProfile?:  {
    __typename: "UserProfile",
    createdAt: string,
    email?: string | null,
    id: string,
    profileOwner?: string | null,
    updatedAt: string,
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

export type OnCreateUserProfileSubscriptionVariables = {
  filter?: ModelSubscriptionUserProfileFilterInput | null,
  profileOwner?: string | null,
};

export type OnCreateUserProfileSubscription = {
  onCreateUserProfile?:  {
    __typename: "UserProfile",
    createdAt: string,
    email?: string | null,
    id: string,
    profileOwner?: string | null,
    updatedAt: string,
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

export type OnDeleteUserProfileSubscriptionVariables = {
  filter?: ModelSubscriptionUserProfileFilterInput | null,
  profileOwner?: string | null,
};

export type OnDeleteUserProfileSubscription = {
  onDeleteUserProfile?:  {
    __typename: "UserProfile",
    createdAt: string,
    email?: string | null,
    id: string,
    profileOwner?: string | null,
    updatedAt: string,
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

export type OnUpdateUserProfileSubscriptionVariables = {
  filter?: ModelSubscriptionUserProfileFilterInput | null,
  profileOwner?: string | null,
};

export type OnUpdateUserProfileSubscription = {
  onUpdateUserProfile?:  {
    __typename: "UserProfile",
    createdAt: string,
    email?: string | null,
    id: string,
    profileOwner?: string | null,
    updatedAt: string,
  } | null,
};
