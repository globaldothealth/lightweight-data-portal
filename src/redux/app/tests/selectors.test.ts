import { describe, it, expect } from 'vitest';
import { selectUserProfile } from '../selectors.ts';
import { RootState } from '../../store.ts';

describe('App Selectors', () => {
    it('should select user profile', () => {
        const mockState = {
            app: {
                userProfile: { email: 'test@example.com', id: '123' },
                error: undefined,
                isLoading: false,
            },
        } as RootState;

        const result = selectUserProfile(mockState);
        expect(result).toEqual({ email: 'test@example.com', id: '123' });
    });
});

