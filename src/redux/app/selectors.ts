import {User} from "../../models/User.ts";
import { RootState } from '../store';

export const selectUserProfile: (state: RootState) => User | undefined = (
    state,
) => state.app.userProfile;

export const selectIsLoading: (state: RootState) => boolean = (
    state,
) => state.app.isLoading;
