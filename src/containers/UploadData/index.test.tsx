import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { uploadData } from 'aws-amplify/storage';

import UploadData from './index';
import dataDownloadsReducer, { S3Folder } from '../../redux/dataDownloads/slice';
import uploadDataReducer from '../../redux/uploadData/slice';

vi.mock('aws-amplify/storage', () => ({
    uploadData: vi.fn(),
    list: vi.fn(),
    getUrl: vi.fn(),
}));

const createStore = (stateOverrides = {}) => configureStore({
    reducer: {
        dataDownloads: dataDownloadsReducer,
        uploadData: uploadDataReducer,
    },
    preloadedState: {
        dataDownloads: {
            isLoading: false,
            s3Folder: S3Folder.All,
            s3Files: [],
            error: undefined,
        },
        uploadData: {
            isLoading: false,
            error: undefined,
            ...stateOverrides,
        },
    },
});

const renderWithStore = (stateOverrides = {}) => {
    const store = createStore(stateOverrides);
    return {
        store,
        ...render(
            <Provider store={store}>
                <UploadData />
            </Provider>
        )
    };
};

describe('UploadData Container', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(uploadData).mockResolvedValue(undefined as never);
    });

    it('renders the upload data form with all required elements', () => {
        renderWithStore();

        expect(screen.getByRole('heading', { name: 'Upload Data' })).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: /Outbreak Name/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Select CSV File/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Upload Data/i })).toBeInTheDocument();
        expect(screen.getByText('No file selected')).toBeInTheDocument();
    });

    it('displays a description of the upload process', () => {
        renderWithStore();

        expect(screen.getByText(/Select an outbreak first, then choose the CSV file/i)).toBeInTheDocument();
        expect(screen.getByText(/The selected file name does not matter/i)).toBeInTheDocument();
    });

    it('updates the selected file label when a CSV is chosen', async () => {
        const user = userEvent.setup();
        renderWithStore();

        const file = new File(['test data'], 'test.csv', { type: 'text/csv' });
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;

        await user.upload(input, file);

        expect(screen.getByText('Selected file: test.csv')).toBeInTheDocument();
    });

    it('disables the upload button when no file is selected', () => {
        renderWithStore();

        expect(screen.getByRole('button', { name: /Upload Data/i })).toBeDisabled();
    });

    it('disables the upload button while the upload is in progress', async () => {
        const user = userEvent.setup();
        renderWithStore({ isLoading: true, error: undefined });

        const file = new File(['test data'], 'test.csv', { type: 'text/csv' });
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;

        await user.upload(input, file);

        expect(screen.getByRole('button', { name: /Uploading\.\.\./i })).toBeDisabled();
    });

    it('dispatches the upload thunk with the correct payload when the form is submitted', async () => {
        const user = userEvent.setup();
        renderWithStore();

        const file = new File(['test data'], 'test.csv', { type: 'text/csv' });
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;

        await user.upload(input, file);
        await user.click(screen.getByRole('button', { name: /Upload Data/i }));

        expect(uploadData).toHaveBeenCalledWith(
            expect.objectContaining({
                data: file,
                options: {
                    bucket: 'gh-outbreak-data',
                    contentType: 'text/csv',
                },
            })
        );
    });

    it('shows a success alert after a successful upload', async () => {
        const user = userEvent.setup();
        renderWithStore();

        const file = new File(['test data'], 'test.csv', { type: 'text/csv' });
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;

        await user.upload(input, file);
        await user.click(screen.getByRole('button', { name: /Upload Data/i }));

        expect(await screen.findByText('File successfully uploaded to S3!')).toBeInTheDocument();
    });

    it('shows an error alert when the store contains an upload error', () => {
        renderWithStore({ error: 'Failed to upload file' });

        expect(screen.getByText('Failed to upload file')).toBeInTheDocument();
    });

    it('renders the outbreak selector with the configured default value', async () => {
        const user = userEvent.setup();
        renderWithStore();

        const combobox = screen.getByRole('combobox', { name: /Outbreak Name/i });
        expect(combobox).toHaveTextContent(S3Folder.EbolaBVD);

        await user.click(combobox);
        const listbox = await screen.findByRole('listbox');
        expect(within(listbox).getByRole('option', { name: S3Folder.EbolaBVD })).toBeInTheDocument();
    });

    it('clears the success alert when a different file is selected', async () => {
        const user = userEvent.setup();
        renderWithStore();

        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        const file1 = new File(['first'], 'first.csv', { type: 'text/csv' });
        const file2 = new File(['second'], 'second.csv', { type: 'text/csv' });

        await user.upload(input, file1);
        await user.click(screen.getByRole('button', { name: /Upload Data/i }));
        expect(await screen.findByText('File successfully uploaded to S3!')).toBeInTheDocument();

        await user.upload(input, file2);

        expect(screen.queryByText('File successfully uploaded to S3!')).not.toBeInTheDocument();
        expect(screen.getByText('Selected file: second.csv')).toBeInTheDocument();
    });
});
