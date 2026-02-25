import {ComponentType} from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach, afterEach, beforeAll} from 'vitest';
import {MemoryRouter} from 'react-router-dom';

import * as reduxHooks from '../../hooks/redux';
import {getUserProfile, logout} from '../../redux/app/thunk';


// Update this list with new containers and their expected menu index after adding new containers to App.tsx.
// This will ensure we have coverage for all containers and correct menu index passed to Sidebar.
const containerList = [
    {containerName: 'DataDownloads', path: '/data-downloads', id: 'data-downloads', expectedIndex: '0'},
    {
        containerName: 'LocationAdminExplorer',
        path: '/location-admin-explorer',
        id: 'location-admin-explorer',
        expectedIndex: '1'
    }
];

// Mock Sidebar
vi.mock('../../components/Sidebar', () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: ({drawerOpen, selectedMenuIndex, handleLogout}: any) => (
        <div data-testid="sidebar">
            <span data-testid="drawer-open">{drawerOpen.toString()}</span>
            <span data-testid="selected-menu-index">{selectedMenuIndex}</span>
            <button data-testid="logout-button" onClick={handleLogout}>Logout</button>
        </div>
    )
}));

// Mock Redux hooks and thunks
vi.mock('../../hooks/redux', () => ({
    useAppDispatch: vi.fn(),
}));
vi.mock('../../redux/app/thunk', () => ({
    getUserProfile: vi.fn(),
    logout: vi.fn(),
}));

describe('App Container', () => {
    // We need to import App dynamically after mocking
    let App: ComponentType;
    const mockDispatch = vi.fn();

    beforeAll(async () => {
        // Dynamically mock containers
        containerList.forEach(({id, containerName}) => {
            vi.doMock(`../${containerName}`, () => ({
                default: () => <div data-testid={id}>{containerName} Component</div>
            }));
        });

        // Import App after mocks are set up
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const module: any = await import('./index');
        App = module.default;
    });

    beforeEach(() => {
        vi.mocked(reduxHooks.useAppDispatch).mockReturnValue(mockDispatch);
        mockDispatch.mockClear();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(getUserProfile).mockReturnValue({type: 'mock-getUserProfile'} as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(logout).mockReturnValue({type: 'mock-logout'} as any);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders and fetches user profile on mount', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <App/>
            </MemoryRouter>
        );

        // Verify that getUserProfile action is dispatched on mount
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({type: 'mock-getUserProfile'}));
        expect(getUserProfile).toHaveBeenCalled();
    });

    it.each(containerList)('renders container (id: $id) and passes selected menu index $expectedIndex to Sidebar for path $path', (
        {path, id, expectedIndex}) => {
        render(
            <MemoryRouter initialEntries={[path]}>
                <App/>
            </MemoryRouter>
        );

        // Check if the correct container is rendered based on the path and if the correct menu index is passed to Sidebar
        expect(screen.getByTestId(id)).toBeInTheDocument();
        expect(screen.getByTestId('selected-menu-index')).toHaveTextContent(expectedIndex);
    });

    it('toggles sidebar drawer when toggle button is clicked', async () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <App/>
            </MemoryRouter>
        );

        // Check if drawer is open initially
        expect(screen.getByTestId('drawer-open')).toHaveTextContent('true');

        // Close the drawer by clicking the toggle button and check if it is closed
        const toggleButton = screen.getByTestId('toggle-sidebar');
        fireEvent.click(toggleButton);
        expect(screen.getByTestId('drawer-open')).toHaveTextContent('false');
    });

    it('dispatches logout action when handleLogout is called from Sidebar', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <App/>
            </MemoryRouter>
        );

        // Click the logout button in the Sidebar and verify that the logout action is dispatched
        const logoutButton = screen.getByTestId('logout-button');
        fireEvent.click(logoutButton);
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({type: 'mock-logout'}));
        expect(logout).toHaveBeenCalled();
    });
});

