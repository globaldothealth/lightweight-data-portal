import { describe, it, expect } from 'vitest';
import manageUsersReducer, { Groups } from '../slice';
import { getUsers, addUserToGroup, removeUserFromGroup, deleteUser } from '../thunk';

describe('ManageUsers Slice', () => {
    const initialState = {
        isLoading: false,
        users: [],
        error: undefined,
    };

    it('should handle initial state', () => {
        expect(manageUsersReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    describe('getUsers', () => {
        it('should handle pending', () => {
            const action = { type: getUsers.pending.type };
            const state = manageUsersReducer(initialState, action);
            expect(state.isLoading).toBe(true);
            expect(state.error).toBeUndefined();
        });

        it('should handle fulfilled', () => {
            const mockUsers = [{ id: '1', email: 'test@test.com', groups: [] }];
            const action = { type: getUsers.fulfilled.type, payload: mockUsers };
            const state = manageUsersReducer(initialState, action);
            expect(state.isLoading).toBe(false);
            expect(state.users).toEqual(mockUsers);
        });

        it('should handle rejected', () => {
            const error = 'Fetch error';
            const action = { type: getUsers.rejected.type, payload: error };
            const state = manageUsersReducer(initialState, action);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(error);
            expect(state.users).toEqual([]);
        });
    });

    describe('addUserToGroup', () => {
        const initialStateWithUsers = {
            isLoading: false,
            users: [{ id: '1', email: 'test@test.com', groups: [] }],
            error: undefined,
        };

        it('should handle pending', () => {
            const action = { type: addUserToGroup.pending.type };
            const state = manageUsersReducer(initialStateWithUsers, action);
            expect(state.isLoading).toBe(true);
            expect(state.error).toBeUndefined();
        });

        it('should handle fulfilled', () => {
            const action = { type: addUserToGroup.fulfilled.type, payload: { userId: '1', groupName: Groups.ADMINS } };
            const state = manageUsersReducer({ ...initialStateWithUsers, isLoading: true }, action);
            expect(state.isLoading).toBe(false);
            expect(state.users[0].groups).toContain(Groups.ADMINS);
        });

        it('should handle rejected', () => {
            const error = 'Add error';
            const action = { type: addUserToGroup.rejected.type, payload: error };
            const state = manageUsersReducer({ ...initialStateWithUsers, isLoading: true }, action);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(error);
        });
    });

    describe('removeUserFromGroup', () => {
        const initialStateWithGroup = {
            isLoading: false,
            users: [{ id: '1', email: 'test@test.com', groups: [Groups.ADMINS] }],
            error: undefined,
        };

        it('should handle pending', () => {
            const action = { type: removeUserFromGroup.pending.type };
            const state = manageUsersReducer(initialStateWithGroup, action);
            expect(state.isLoading).toBe(true);
            expect(state.error).toBeUndefined();
        });

        it('should handle fulfilled', () => {
            const action = { type: removeUserFromGroup.fulfilled.type, payload: { userId: '1', groupName: Groups.ADMINS } };
            const state = manageUsersReducer({ ...initialStateWithGroup, isLoading: true }, action);
            expect(state.isLoading).toBe(false);
            expect(state.users[0].groups).not.toContain(Groups.ADMINS);
        });

        it('should handle rejected', () => {
            const error = 'Remove error';
            const action = { type: removeUserFromGroup.rejected.type, payload: error };
            const state = manageUsersReducer({ ...initialStateWithGroup, isLoading: true }, action);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(error);
        });
    });

    describe('deleteUser', () => {
        const initialStateWithUsers = {
            isLoading: false,
            users: [{ id: '1', email: 'test@test.com', groups: [] }, { id: '2', email: 'test2@test.com', groups: [] }],
            error: undefined,
        };

        it('should handle pending', () => {
            const action = { type: deleteUser.pending.type };
            const state = manageUsersReducer(initialStateWithUsers, action);
            expect(state.isLoading).toBe(true);
            expect(state.error).toBeUndefined();
        });

        it('should handle fulfilled', () => {
            const action = { type: deleteUser.fulfilled.type, payload: '1' };
            const state = manageUsersReducer({ ...initialStateWithUsers, isLoading: true }, action);
            expect(state.isLoading).toBe(false);
            expect(state.users.length).toBe(1);
            expect(state.users.find(u => u.id === '1')).toBeUndefined();
        });

        it('should handle rejected', () => {
            const error = 'Delete error';
            const action = { type: deleteUser.rejected.type, payload: error };
            const state = manageUsersReducer({ ...initialStateWithUsers, isLoading: true }, action);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(error);
            expect(state.users.length).toBe(2);
        });
    });
});

