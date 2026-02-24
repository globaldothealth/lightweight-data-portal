import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import DataDownloads from './index';
import * as reduxHooks from '../../hooks/redux';
import { selectUserProfile } from '../../redux/app/selectors';
import {
    selectS3Files,
    selectS3Folder,
    selectIsLoading
} from '../../redux/dataDownloads/selectors';
import { S3Folder } from '../../redux/dataDownloads/slice';
import * as downloadThunks from '../../redux/dataDownloads/thunk';


// Mock the dataDownloads thunks
vi.mock('../../redux/dataDownloads/thunk', () => ({
    getFilesFromS3Folder: vi.fn(),
    handleDownload: vi.fn(),
}));

// Mock Redux hooks
vi.mock('../../hooks/redux', () => ({
    useAppDispatch: vi.fn(),
    useAppSelector: vi.fn(),
}));

// Mock app and dataDownloads selectors
vi.mock('../../redux/dataDownloads/selectors', () => ({
    selectS3Files: vi.fn(),
    selectS3Folder: vi.fn(),
    selectIsLoading: vi.fn(),
}));

vi.mock('../../redux/app/selectors', () => ({
    selectUserProfile: vi.fn(),
}));


describe('DataDownloads Container', () => {
    const mockDispatch = vi.fn();

    beforeEach(() => {
        vi.mocked(reduxHooks.useAppDispatch).mockReturnValue(mockDispatch);
        // Reset mocks
        mockDispatch.mockClear();
        vi.mocked(downloadThunks.getFilesFromS3Folder).mockReturnValue({ type: 'mock-getFilesFromS3Folder' } as any);
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('fetches data using getFilesFromS3Folder action and displays them in the table', () => {
        const visibleFilename1 = 'Mpox_2022.csv';
        const visibleFilename2 = 'Mpox_2024.csv';
        const file1 = { name: 'Mpox_2022.csv', filename: `public/${visibleFilename1}` };
        const file2 = { name: 'Mpox_2024.csv', filename: `public/${visibleFilename2}` };

        // Setup state
        const mockS3Folder = S3Folder.Mpox2024;
        const mockFiles = [file1, file2];
        const mockUserProfile = { name: 'Test User' };

        // Mock Selector implementations
        vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
            if (selector === selectS3Folder) return mockS3Folder;
            if (selector === selectS3Files) return mockFiles;
            if (selector === selectIsLoading) return false;
            if (selector === selectUserProfile) return mockUserProfile;
            return undefined;
        });

        render(<DataDownloads />);

        // Check if getFilesFromS3Folder was dispatched with the correct folder
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'mock-getFilesFromS3Folder' }));
        expect(downloadThunks.getFilesFromS3Folder).toHaveBeenCalledWith({ s3Folder: mockS3Folder });

        // Verify that returned files are listed in the table
        expect(screen.getByText(file1.name)).toBeInTheDocument();
        expect(screen.getByText(visibleFilename1)).toBeInTheDocument();
        expect(screen.getByText(file2.name)).toBeInTheDocument();
        expect(screen.getByText(visibleFilename2)).toBeInTheDocument();
    });
});

