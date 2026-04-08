import { vi, describe, it, expect, beforeEach } from 'vitest';
import { getUserProfile, logout } from '../thunk.ts';
import { signOut } from 'aws-amplify/auth';
import { client } from "../../../utils/amplifyClient";
import { User, Group } from "../../../models/User.ts";
import { REQUEST_STATUS } from "../../../utils/tests/testConstants.ts";

// Mock dependencies
vi.mock('aws-amplify/auth', () => ({
    signOut: vi.fn()
}));

vi.mock('../../../utils/amplifyClient', () => ({
    client: {
        queries: {
            getUserProfile: vi.fn()
        }
    }
}));

describe('App thunks', () => {
    const mockDispatch = vi.fn();
    const mockGetState = vi.fn();

    const testUP: User = {
        email: 'test@example.com',
        username: 'user-123',
        groups: [Group.ADMINS]
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getUserProfile', () => {
        it('should fulfill with user profile on successful fetch', async () => {
            vi.mocked(client.queries.getUserProfile).mockResolvedValue({
                data: JSON.stringify(testUP)
            } as never);

            const result = await getUserProfile()(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe(REQUEST_STATUS.FULFILLED);
            expect(result.payload).toEqual(testUP);
            expect(client.queries.getUserProfile).toHaveBeenCalledTimes(1);
        });

        it('should reject with correct error message when fetch fails', async () => {
            vi.mocked(client.queries.getUserProfile).mockRejectedValue(new Error('User profile data missing'));

            const result = await getUserProfile()(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe(REQUEST_STATUS.REJECTED);
            expect(result.payload).toBe('User profile data missing');
        });
    });

    describe('logout', () => {
        it('should fulfill on successful sign out', async () => {
            vi.mocked(signOut).mockResolvedValue(undefined);

            const result = await logout()(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe(REQUEST_STATUS.FULFILLED);
            expect(signOut).toHaveBeenCalled();
        });

        it('should reject with custom error message when sign out fails', async () => {
            const errorMessage = 'Cannot sign out of account';
            vi.mocked(signOut).mockRejectedValue(new Error(errorMessage));

            const result = await logout()(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe(REQUEST_STATUS.REJECTED);
            expect(result.payload).toBe(`Logout failed: ${errorMessage}`);
        });
    });
});
