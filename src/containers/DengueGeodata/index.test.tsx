import {render, screen, fireEvent, within, waitFor} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import userEvent from '@testing-library/user-event';

import DengueGeodata from './index';
import * as reduxHooks from '../../hooks/redux';
import {selectUserProfile} from '../../redux/app/selectors';
import {
    selectS3Files,
    selectAvailableCountries,
    selectIsLoading
} from '../../redux/dengueGeodata/selectors';
import * as dengueThunks from '../../redux/dengueGeodata/thunk';


// Mock the thunks
vi.mock('../../redux/dengueGeodata/thunk', () => ({
    getFilesFromMetadata: vi.fn(),
    handleDownload: vi.fn(),
}));

// Mock Redux hooks
vi.mock('../../hooks/redux', () => ({
    useAppDispatch: vi.fn(),
    useAppSelector: vi.fn(),
}));

// Mock selectors
vi.mock('../../redux/dengueGeodata/selectors', () => ({
    selectS3Files: vi.fn(),
    selectAvailableCountries: vi.fn(),
    selectIsLoading: vi.fn(),
}));

vi.mock('../../redux/app/selectors', () => ({
    selectUserProfile: vi.fn(),
}));


describe('DengueGeodata Container', () => {
    const mockDispatch = vi.fn();
    const mockUserProfile = { id: 'Test User', email: 'test@example.com' };

    const mockFiles = [
        {
            name: 'Dataset A',
            filename: 'dataset_a.csv',
            country: 'Brazil',
        },
        {
            name: 'Dataset B',
            filename: 'dataset_b.csv',
            country: 'Vietnam',
        }
    ];

    const mockCountries = {
        'Brazil': 'Brazil',
        'Vietnam': 'Vietnam'
    };

    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(reduxHooks.useAppDispatch).mockReturnValue(mockDispatch);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(dengueThunks.getFilesFromMetadata).mockReturnValue({ type: 'test-action' } as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(dengueThunks.handleDownload).mockReturnValue({ type: 'test-download-action' } as any);
    });

    it('fetches data and displays it in the table', () => {
        vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
            if (selector === selectAvailableCountries) return mockCountries;
            if (selector === selectS3Files) return mockFiles;
            if (selector === selectIsLoading) return false;
            if (selector === selectUserProfile) return mockUserProfile;
            return undefined;
        });
        render(<DengueGeodata />);

        // Check if fetch thunk was dispatched
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'test-action' }));

        // Check if title is present
        expect(screen.getByText('Dengue Geodata')).toBeInTheDocument();

        // Check if data rows are rendered
        expect(screen.getByText('Dataset A')).toBeInTheDocument();
        expect(screen.getByText('Brazil')).toBeInTheDocument();
        expect(screen.getByText('Dataset B')).toBeInTheDocument();
        expect(screen.getByText('Vietnam')).toBeInTheDocument();
    });

    it('renders the usable table country filter', async () => {
        const user = userEvent.setup();
        vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
            if (selector === selectAvailableCountries) return mockCountries;
            if (selector === selectS3Files) return mockFiles;
            if (selector === selectIsLoading) return false;
            if (selector === selectUserProfile) return mockUserProfile;
            return undefined;
        });
        render(<DengueGeodata />);
        const selectButton = screen.getByRole('combobox');
        await user.click(selectButton);

        const listbox = await screen.findByRole('listbox');
        const options = within(listbox).getAllByRole('option');
        const brazilOption = options.find(opt => opt.textContent?.includes('Brazil'));

        if (!brazilOption) throw new Error('Brazil option not found');

        // Click the checkbox specifically
        const checkbox = within(brazilOption).getByRole('checkbox');
        await user.click(checkbox);

        // Close the menu (optional but good practice for multi-selects often)
        await user.keyboard('{Escape}');

        // Material table standard filter placeholder for lookup columns might depend on implementation details,
        // but typically it renders input fields or select boxes in the filter row.
        // Since 'filtering: true' is set, we look for filter inputs.

        // We can verify that the text "Country" exists in the header
        expect(screen.getByText('Country')).toBeInTheDocument();

        // Check that the table is filtered: Dataset A (Brazil) should be visible, Dataset B (Vietnam) should not
        expect(await screen.findByText('Dataset A')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.queryByText('Dataset B')).not.toBeInTheDocument();
        });
    });

    it('dispatches handleDownload when clicking the download button', async () => {
        vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
            if (selector === selectAvailableCountries) return mockCountries;
            if (selector === selectS3Files) return mockFiles;
            if (selector === selectIsLoading) return false;
            if (selector === selectUserProfile) return mockUserProfile;
            return undefined;
        });
        render(<DengueGeodata />);

        const downloadButtons = screen.getAllByText('Download');
        expect(downloadButtons.length).toBe(2);

        // Click the first download button (Dataset A)
        fireEvent.click(downloadButtons[0]);

        expect(mockDispatch).toHaveBeenCalledTimes(2); // 1 for initial fetch, 1 for click
        expect(dengueThunks.handleDownload).toHaveBeenCalledWith({
            s3FileKey: 'dataset_a.csv',
            user: mockUserProfile
        });
    });
});
