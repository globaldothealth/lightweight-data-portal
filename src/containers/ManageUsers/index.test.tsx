import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';

import ManageUsers from './index';
import * as reduxHooks from '../../hooks/redux';
import { selectUserProfile } from "../../redux/app/selectors";
import { selectUsers, selectIsLoading, selectError } from '../../redux/manageUsers/selectors';
import * as manageUsersThunks from "../../redux/manageUsers/thunk";
import {Group} from "../../models/User.ts";

// Mock the thunks
vi.mock('../../redux/manageUsers/thunk', () => ({
    getUsers: vi.fn(),
    addUserToGroup: vi.fn(),
    removeUserFromGroup: vi.fn(),
    deleteUser: vi.fn(),
}));

// Mock Redux hooks
vi.mock('../../hooks/redux', () => ({
    useAppDispatch: vi.fn(),
    useAppSelector: vi.fn(),
}));

// Mock selectors
vi.mock('../../redux/manageUsers/selectors', () => ({
    selectUsers: vi.fn(),
    selectIsLoading: vi.fn(),
    selectError: vi.fn(),
}));

vi.mock('../../redux/app/selectors', () => ({
    selectUserProfile: vi.fn(),
}));

describe('ManageUsers Container', () => {
    const mockDispatch = vi.fn();
    const mockUserProfile = { id: 'Test User', email: 'test@example.com' };
    const user1Id = '1';
    const user1Email = 'user1@example.com'
    const user2Email = 'user2@example.com'
    const testUserEmail = 'user3@example.com'

    const mockUsers = [
        { username: user1Id, email: user1Email, groups: [Group.RESEARCHERS] },
        { username: '2', email: user2Email, groups: [Group.ADMINS] },
        { username: 'Test User', email: testUserEmail, groups: [] }
    ];

    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(reduxHooks.useAppDispatch).mockReturnValue(mockDispatch);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(manageUsersThunks.getUsers).mockReturnValue({ type: 'test-get-users' } as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(manageUsersThunks.addUserToGroup).mockReturnValue({ type: 'test-add-to-group' } as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(manageUsersThunks.removeUserFromGroup).mockReturnValue({ type: 'test-remove-from-group' } as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(manageUsersThunks.deleteUser).mockReturnValue({ type: 'test-delete-user' } as any);
    });

    it('fetches users and displays them in the table', () => {
        vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
            if (selector === selectUsers) return mockUsers;
            if (selector === selectIsLoading) return false;
            if (selector === selectError) return null;
            if (selector === selectUserProfile) return mockUserProfile;
            return undefined;
        });
        render(<ManageUsers />);

        // Check if fetch thunk was dispatched
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'test-get-users' }));

        // Check if title is present
        expect(screen.getByText('Manage Users')).toBeInTheDocument();

        // Check if data rows are rendered
        expect(screen.getByText(user1Email)).toBeInTheDocument();
        expect(screen.getByText(user2Email)).toBeInTheDocument();
        expect(screen.getByText(testUserEmail)).toBeInTheDocument();
    });

    it('dispatches addUserToGroup when selecting a new group', async () => {
        const user = userEvent.setup();
        vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
            if (selector === selectUsers) return mockUsers;
            if (selector === selectIsLoading) return false;
            if (selector === selectError) return null;
            if (selector === selectUserProfile) return mockUserProfile;
            return undefined;
        });
        render(<ManageUsers />);

        const selects = screen.getAllByRole('combobox');
        // user1 is at index 0
        await user.click(selects[0]);

        const listbox = await screen.findByRole('listbox');
        const options = within(listbox).getAllByRole('option');
        const adminsOption = options.find(opt => opt.textContent?.includes(Group.ADMINS));

        if (!adminsOption) throw new Error('Admins option not found');

        // Click ADMINS option
        await user.click(adminsOption);

        expect(manageUsersThunks.addUserToGroup).toHaveBeenCalledWith({ username: user1Id, groupName: Group.ADMINS });
    });

    it('opens delete dialog and dispatches deleteUser', async () => {
        const user = userEvent.setup();
        vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
            if (selector === selectUsers) return mockUsers;
            if (selector === selectIsLoading) return false;
            if (selector === selectError) return null;
            if (selector === selectUserProfile) return mockUserProfile;
            return undefined;
        });
        render(<ManageUsers />);

        // user1 can be deleted
        const deleteUser1Btn = screen.getByTestId('delete-user-1');
        await user.click(deleteUser1Btn);

        expect(screen.getByText('Are you sure you want to delete this user?')).toBeInTheDocument();
        expect(screen.getByText(/user1@example.com will be permanently deleted/i)).toBeInTheDocument();

        const yesButton = screen.getByRole('button', { name: 'Yes' });
        await user.click(yesButton);

        expect(manageUsersThunks.deleteUser).toHaveBeenCalledWith(user1Id);
    });
});
