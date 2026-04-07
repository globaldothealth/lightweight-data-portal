import {vi, describe, it, expect, beforeEach} from 'vitest';
import {getUsers, addUserToGroup, removeUserFromGroup, deleteUser} from '../thunk';
import {client} from '../../../utils/amplifyClient';
import {Groups} from '../slice';


vi.mock('../../../utils/amplifyClient', () => ({
    client: {
        queries: {
            getUsers: vi.fn(),
        },
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
    const user1Id = '1';
    const user1Email = 'email1@example.com';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getUsers', () => {
        it('should fulfill with users on successful fetch', async () => {
            const mockUsers = [{
                username: user1Id,
                email: user1Email,
                groups: [Groups.ADMINS]
            }];
            vi.mocked(client.queries.getUsers).mockResolvedValue({data: JSON.stringify(mockUsers)} as never);

            const result = await getUsers()(mockDispatch, vi.fn(), undefined);

            expect(result.meta.requestStatus).toBe('fulfilled');
            expect(result.payload).toEqual(mockUsers);
        });

        it('should reject when error occurs', async () => {
            vi.mocked(client.queries.getUsers).mockRejectedValue(new Error('Failed to fetch users') as never);

            const result = await getUsers()(mockDispatch, vi.fn(), undefined);

            expect(result.meta.requestStatus).toBe('rejected');
            expect(result.payload).toBe('Failed to fetch users');
        });
    });

    describe('addUserToGroup', () => {
        it('should fulfill on successful addition', async () => {
            vi.mocked(client.mutations.addUserToGroup).mockResolvedValue({} as never);

            const data = {username: user1Id, groupName: Groups.ADMINS};
            const result = await addUserToGroup(data)(mockDispatch, vi.fn(), undefined);

            expect(result.meta.requestStatus).toBe('fulfilled');
            expect(result.payload).toEqual(data);
            expect(client.mutations.addUserToGroup).toHaveBeenCalledWith(data);
        });

        it('should reject on error', async () => {
            vi.mocked(client.mutations.addUserToGroup).mockRejectedValue(new Error('failed'));

            const data = {username: user1Id, groupName: Groups.ADMINS};
            const result = await addUserToGroup(data)(mockDispatch, vi.fn(), undefined);

            expect(result.meta.requestStatus).toBe('rejected');
            expect(result.payload).toBe('failed');
        });
    });

    describe('removeUserFromGroup', () => {
        it('should fulfill on successful removal', async () => {
            vi.mocked(client.mutations.removeUserFromGroup).mockResolvedValue({} as never);

            const data = {username: user1Id, groupName: Groups.ADMINS};
            const result = await removeUserFromGroup(data)(mockDispatch, vi.fn(), undefined);

            expect(result.meta.requestStatus).toBe('fulfilled');
            expect(result.payload).toEqual(data);
            expect(client.mutations.removeUserFromGroup).toHaveBeenCalledWith(data);
        });

        it('should reject on error', async () => {
            vi.mocked(client.mutations.removeUserFromGroup).mockRejectedValue(new Error('failed'));

            const data = {username: user1Id, groupName: Groups.ADMINS};
            const result = await removeUserFromGroup(data)(mockDispatch, vi.fn(), undefined);

            expect(result.meta.requestStatus).toBe('rejected');
            expect(result.payload).toBe('failed');
        });
    });

    describe('deleteUser', () => {
        it('should fulfill on successful deletion', async () => {
            const mockGetState = vi.fn().mockReturnValue({
                manageUsers: {
                    users: [{username: user1Id, email: user1Email, groups: []}]
                }
            });

            vi.mocked(client.mutations.deleteUser).mockResolvedValue({} as never);

            const result = await deleteUser(user1Id)(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe('fulfilled');
            expect(result.payload).toBe(user1Id);
            expect(client.mutations.deleteUser).toHaveBeenCalledWith({username: user1Id});
        });

        it('should reject when deleting admin', async () => {
            const mockGetState = vi.fn().mockReturnValue({
                manageUsers: {
                    users: [{username: user1Id, email: user1Email, groups: [Groups.ADMINS]}]
                }
            });

            const result = await deleteUser(user1Id)(mockDispatch, mockGetState, undefined);

            expect(result.meta.requestStatus).toBe('rejected');
            expect(result.payload).toBe('Cannot delete an admin user');
        });
    });
});
