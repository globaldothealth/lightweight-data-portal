import {vi, describe, it, expect, beforeEach} from 'vitest';
import {getUsers, addUserToGroup, removeUserFromGroup, deleteUser} from '../thunk';
import {fetchAuthSession} from 'aws-amplify/auth';
import {client} from '../../../utils/amplifyClient';
import {Groups} from '../slice';

const mockSend = vi.fn();

// Mock dependencies
vi.mock('aws-amplify/auth', () => ({
    fetchAuthSession: vi.fn(),
}));

vi.mock('@aws-sdk/client-cognito-identity-provider', () => ({
    CognitoIdentityProviderClient: class {
        send = mockSend;
    },
    ListUsersCommand: class {
    },
    AdminListGroupsForUserCommand: class {
    },
    AdminDeleteUserCommand: class {
    },
}));

vi.mock('../../../utils/amplifyClient', () => ({
    client: {
        mutations: {
            addUserToGroup: vi.fn(),
            removeUserFromGroup: vi.fn(),
            deleteUser: vi.fn(),
        }
    }
}));

vi.mock('../../../amplify_outputs.json', () => ({
    default: {
        auth: {
            aws_region: 'us-east-1',
            user_pool_id: 'test-user-pool',
        }
    }
}));

describe('ManageUsers thunks', () => {
    const mockDispatch = vi.fn();
    const user1Id = 'id1';
    const user1Email = 'email1@example.com';
    const mockCredentials = {accessKeyId: 'test', secretAccessKey: 'test'}

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getUsers', () => {
        it('should fulfill with users on successful fetch', async () => {
            vi.mocked(fetchAuthSession).mockResolvedValue({credentials: mockCredentials} as never);

            mockSend
                .mockResolvedValueOnce({
                    Users: [
                        {
                            Username: 'user1',
                            Attributes: [{Name: 'email', Value: user1Email}, {Name: 'sub', Value: user1Id}]
                        }
                    ]
                })
                .mockResolvedValueOnce({
                    Groups: [{GroupName: Groups.ADMINS}]
                });

            const result = await getUsers()(mockDispatch, vi.fn(), undefined);

            expect(result.meta.requestStatus).toBe('fulfilled');
            expect(result.payload).toEqual([{
                id: user1Id,
                email: user1Email,
                groups: [Groups.ADMINS]
            }]);
        });

        it('should reject when no credentials', async () => {
            vi.mocked(fetchAuthSession).mockResolvedValue({credentials: undefined} as never);

            const result = await getUsers()(mockDispatch, vi.fn(), undefined);

            expect(result.meta.requestStatus).toBe('rejected');
            expect(result.payload).toBe('No credentials');
        });
    });

    describe('addUserToGroup', () => {
        it('should fulfill on successful addition', async () => {
            vi.mocked(client.mutations.addUserToGroup).mockResolvedValue({} as never);

            const data = {userId: user1Id, groupName: Groups.ADMINS};
            const result = await addUserToGroup(data)(mockDispatch, vi.fn(), undefined);

            expect(result.meta.requestStatus).toBe('fulfilled');
            expect(result.payload).toEqual(data);
            expect(client.mutations.addUserToGroup).toHaveBeenCalledWith(data);
        });

        it('should reject on error', async () => {
            vi.mocked(client.mutations.addUserToGroup).mockRejectedValue(new Error('failed'));

            const data = {userId: user1Id, groupName: Groups.ADMINS};
            const result = await addUserToGroup(data)(mockDispatch, vi.fn(), undefined);

            expect(result.meta.requestStatus).toBe('rejected');
            expect(result.payload).toBe('failed');
        });
    });

    describe('removeUserFromGroup', () => {
        it('should fulfill on successful removal', async () => {
            vi.mocked(client.mutations.removeUserFromGroup).mockResolvedValue({} as never);

            const data = {userId: user1Id, groupName: Groups.ADMINS};
            const result = await removeUserFromGroup(data)(mockDispatch, vi.fn(), undefined);

            expect(result.meta.requestStatus).toBe('fulfilled');
            expect(result.payload).toEqual(data);
            expect(client.mutations.removeUserFromGroup).toHaveBeenCalledWith(data);
        });

        it('should reject on error', async () => {
            vi.mocked(client.mutations.removeUserFromGroup).mockRejectedValue(new Error('failed'));

            const data = {userId: user1Id, groupName: Groups.ADMINS};
            const result = await removeUserFromGroup(data)(mockDispatch, vi.fn(), undefined);

            expect(result.meta.requestStatus).toBe('rejected');
            expect(result.payload).toBe('failed');
        });
    });

    describe('deleteUser', () => {
        it('should fulfill on successful deletion', async () => {
            const mockGetState = vi.fn().mockReturnValue({
                manageUsers: {
                    users: [{id: user1Id, email: user1Email, groups: []}]
                }
            });

            vi.mocked(client.mutations.deleteUser).mockResolvedValue({} as never);

            const result = await deleteUser(user1Id)(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe('fulfilled');
            expect(result.payload).toBe(user1Id);
            expect(client.mutations.deleteUser).toHaveBeenCalledWith({userId: user1Id});
        });

        it('should reject when deleting admin', async () => {
            const mockGetState = vi.fn().mockReturnValue({
                manageUsers: {
                    users: [{id: user1Id, email: user1Email, groups: [Groups.ADMINS]}]
                }
            });

            const result = await deleteUser(user1Id)(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe('rejected');
            expect(result.payload).toBe('Cannot delete an admin user');
        });
    });
});
