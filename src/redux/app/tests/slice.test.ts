import { describe, it, expect } from 'vitest';
import appReducer from '../slice.ts';
import { getUserProfile, logout } from '../thunk.ts';

describe('App Slice', () => {
    const initialState = {
        error: undefined,
        isLoading: false,
        userProfile: undefined
    };

    it('should handle initial state', () => {
        expect(appReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    describe('getUserProfile', () => {
        it('should handle pending', () => {
            const action = { type: getUserProfile.pending.type };
            const state = appReducer(initialState, action);
            expect(state.isLoading).toBe(true);
            expect(state.error).toBeUndefined();
        });

        it('should handle fulfilled', () => {
            const mockProfile = { email: 'test@example.com', id: '123' };
            const action = { type: getUserProfile.fulfilled.type, payload: mockProfile };
            const state = appReducer(initialState, action);
            expect(state.isLoading).toBe(false);
            expect(state.userProfile).toEqual(mockProfile);
        });

        it('should handle rejected', () => {
            const error = 'Fetch failed';
            const action = { type: getUserProfile.rejected.type, payload: error };
            const state = appReducer(initialState, action);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(error);
            expect(state.userProfile).toBeUndefined();
        });
    });

    describe('logout', () => {
        it('should handle pending', () => {
            const action = { type: logout.pending.type };
            const state = appReducer(initialState, action);
            expect(state.isLoading).toBe(true);
            expect(state.error).toBeUndefined();
        });

        it('should handle fulfilled', () => {
            const startState = { ...initialState, userProfile: { email: 'a', id: '1', groups: ['ADMINS'] } };
            const action = { type: logout.fulfilled.type };
            const state = appReducer(startState, action);
            expect(state.isLoading).toBe(false);
            expect(state.userProfile).toBeUndefined();
        });

        it('should handle rejected', () => {
            const error = 'Logout error';
            const action = { type: logout.rejected.type, payload: error };
            const state = appReducer(initialState, action);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(error);
        });
    });
});

