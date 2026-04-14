import {RootState} from '../store';
import {User} from "../../models/User.ts";

export const selectUsers: (state: RootState) => User[] = (
    state,
) => state.manageUsers.users;
export const selectIsLoading: (state: RootState) => boolean = (state) =>
    state.manageUsers.isLoading;
export const selectError: (state: RootState) => string | undefined = (state) =>
    state.manageUsers.error;
