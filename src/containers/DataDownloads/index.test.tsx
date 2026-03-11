import {render, screen, cleanup, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll} from 'vitest';

import DataDownloads from './index';
import * as reduxHooks from '../../hooks/redux';
import {selectUserProfile} from '../../redux/app/selectors';
import {
    selectS3Files,
    selectS3Folder,
    selectIsLoading
} from '../../redux/dataDownloads/selectors';
import {S3File, S3Folder} from '../../redux/dataDownloads/slice';
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
    const visibleFilename1 = 'Mpox_2022.csv';
    const visibleFilename2 = 'Mpox_2024.csv';
    const file1 = {name: 'Mpox_2022.csv', filename: `public/${visibleFilename1}`};
    const file2 = {name: 'Mpox_2024.csv', filename: `public/${visibleFilename2}`};
    const mockUserProfile = {name: 'Test User'};
    const originalWarn = console.warn.bind(console.warn)

    // Hide warnings about MUI anchorEl during tests
    beforeAll(() => {
        console.warn = (msg) =>
            !msg.toString().includes('MUI: The `anchorEl` prop provided to the component is invalid.') && originalWarn(msg)
    })
    afterAll(() => {
        console.warn = originalWarn
    })

    beforeEach(() => {
        vi.mocked(reduxHooks.useAppDispatch).mockReturnValue(mockDispatch);
        // Reset mocks
        mockDispatch.mockClear();
        // We cannot easily type this return types
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(downloadThunks.getFilesFromS3Folder).mockReturnValue({type: 'mock-getFilesFromS3Folder'} as any);
    });

    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    it('fetches data using getFilesFromS3Folder action and displays them in the table', () => {
        const mockS3Folder = S3Folder.Mpox2024;
        const mockFiles = [file1, file2];

        // Mock Selector implementations
        vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
            if (selector === selectS3Folder) return mockS3Folder;
            if (selector === selectS3Files) return mockFiles;
            if (selector === selectIsLoading) return false;
            if (selector === selectUserProfile) return mockUserProfile;
            return undefined;
        });

        render(<DataDownloads/>);

        // Check if getFilesFromS3Folder was dispatched with the correct folder
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({type: 'mock-getFilesFromS3Folder'}));
        expect(downloadThunks.getFilesFromS3Folder).toHaveBeenCalledWith({s3Folder: mockS3Folder});

        // Verify that returned files are listed in the table
        expect(screen.getByText(file1.name)).toBeInTheDocument();
        expect(screen.getByText(visibleFilename1)).toBeInTheDocument();
        expect(screen.getByText(file2.name)).toBeInTheDocument();
        expect(screen.getByText(visibleFilename2)).toBeInTheDocument();
    });

    it('refetches list of files when a different folder is selected', () => {
        const initialS3Folder = S3Folder.Mpox2024;
        const newS3Folder = S3Folder.AvianInfluenza;
        const mockFiles: S3File[] = [];

        // Mock Selector implementations - flexible based on call count or simply mocked
        let currentS3Folder = initialS3Folder;

        vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
            if (selector === selectS3Folder) return currentS3Folder;
            if (selector === selectS3Files) return mockFiles;
            if (selector === selectIsLoading) return false;
            if (selector === selectUserProfile) return mockUserProfile;
            return undefined;
        });

        const {rerender} = render(<DataDownloads/>);

        // Select another outbreaks from the dropdown
        const selectButton = screen.getByRole('combobox', {name: /Selected Outbreak/i});
        fireEvent.mouseDown(selectButton);
        const newOption = screen.getByRole('option', {name: newS3Folder});
        fireEvent.click(newOption);

        // Simulate Redux state update and re-render to trigger useEffect
        currentS3Folder = newS3Folder;
        rerender(<DataDownloads/>);

        // Check if folder change triggered getFilesFromS3Folder with new folder
        expect(downloadThunks.getFilesFromS3Folder).toHaveBeenCalledWith({s3Folder: newS3Folder});
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({type: 'mock-getFilesFromS3Folder'}));
    });

    it('dispatches handleDownload action when download button is clicked', () => {
        const mockFiles = [file1];
        const mockS3Folder = S3Folder.Mpox2024;

        // We cannot easily type this return types
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(downloadThunks.handleDownload).mockReturnValue({type: 'mock-handleDownload'} as any);

        vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
            if (selector === selectS3Folder) return mockS3Folder;
            if (selector === selectS3Files) return mockFiles;
            if (selector === selectIsLoading) return false;
            if (selector === selectUserProfile) return mockUserProfile;
            return undefined;
        });

        render(<DataDownloads/>);

        // Click the download button and check if handleDownload was dispatched with correct file key and user profile
        const downloadButton = screen.getByRole('button', {name: /download/i});
        fireEvent.click(downloadButton);
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({type: 'mock-handleDownload'}));
        expect(downloadThunks.handleDownload).toHaveBeenCalledWith({s3FileKey: file1.filename, user: mockUserProfile});
    });
});
