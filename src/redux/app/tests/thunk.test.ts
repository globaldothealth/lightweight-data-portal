import { vi, describe, it, expect, beforeEach } from 'vitest';
import { getUserProfile, logout } from '../thunk.ts';
import { fetchUserAttributes, fetchAuthSession, signOut } from 'aws-amplify/auth';
import { UserProfile } from "../slice.ts";

// Mock dependencies
vi.mock('aws-amplify/auth', () => ({
    fetchUserAttributes: vi.fn(),
    fetchAuthSession: vi.fn(),
    signOut: vi.fn()
}));

describe('App thunks', () => {
    const mockDispatch = vi.fn();
    const mockGetState = vi.fn();

    const testUP: UserProfile = {
        email: 'test@example.com',
        id: 'user-123',
        groups: ['admin']
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getUserProfile', () => {
        it('should fulfill with user profile on successful fetch', async () => {
            const mockAttributes = { email: testUP.email, sub: testUP.id };
            vi.mocked(fetchUserAttributes).mockResolvedValue(mockAttributes);

            // Mock the auth session containing the cognito groups
            vi.mocked(fetchAuthSession).mockResolvedValue({
                tokens: {
                    accessToken: {
                        payload: {
                            'cognito:groups': testUP.groups,
                        }
                    }
                }
            } as never);

            const result = await getUserProfile()(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe('fulfilled');
            expect(result.payload).toEqual(testUP);
            expect(fetchUserAttributes).toHaveBeenCalledTimes(1);
            expect(fetchAuthSession).toHaveBeenCalledTimes(1);
        });

        it('should reject with correct error message when email or sub is missing', async () => {
            vi.mocked(fetchUserAttributes).mockResolvedValue({ email: testUP.email });

            // Allow fetchAuthSession to succeed so the thunk reaches the missing email/sub check
            vi.mocked(fetchAuthSession).mockResolvedValue({
                tokens: {
                    accessToken: {
                        payload: {}
                    }
                }
            } as never);

            const result = await getUserProfile()(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe('rejected');
            expect(result.payload).toBe('User profile data missing');
        });
    });

    describe('logout', () => {
        it('should fulfill on successful sign out', async () => {
            vi.mocked(signOut).mockResolvedValue(undefined);

            const result = await logout()(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe('fulfilled');
            expect(signOut).toHaveBeenCalled();
        });

        it('should reject with custom error message when sign out fails', async () => {
            const errorMessage = 'Cannot sign out of account';
            vi.mocked(signOut).mockRejectedValue(new Error(errorMessage));

            const result = await logout()(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe('rejected');
            expect(result.payload).toBe(`Logout failed: ${errorMessage}`);
        });
    });
});
