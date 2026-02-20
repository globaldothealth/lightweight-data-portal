import { UserProfile } from './slice';
import { RootState } from '../store';

export const selectUserProfile: (state: RootState) => UserProfile | undefined = (
    state,
) => state.app.userProfile;
