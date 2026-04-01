import { describe, it, expect, vi } from 'vitest';
import { selectUsers, selectIsLoading, selectError } from '../selectors.ts';
import { RootState } from '../../store.ts';

vi.mock('aws-amplify/data', () => ({
    generateClient: vi.fn(),
}));

describe('ManageUsers Selectors', () => {
    const user1 = { id: '1', email: '1@1.1', groups: ['ADMINS'] };
    const user2 = { id: '2', email: '2@2.2', groups: ['RESEARCHER'] };
    const errorMessage = 'error message';
    const mockState = {
        manageUsers: {
            users: [user1, user2],
            isLoading: true,
            error: errorMessage
        }
    } as unknown as RootState;

    it('should select users', () => {
        expect(selectUsers(mockState)).toEqual([user1, user2]);
    });

    it('should select isLoading', () => {
        expect(selectIsLoading(mockState)).toBe(true);
    });

    it('should select error', () => {
        expect(selectError(mockState)).toBe(errorMessage);
    });
});
