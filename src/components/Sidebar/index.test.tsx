import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Sidebar from './index';

// Mock react-router-dom and location
const mockNavigate = vi.fn();
const mockLocation = { pathname: '/current-path' };

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
}));

describe('Sidebar Component', () => {
    const mockHandleLogout = vi.fn();
    const drawerWidth = 240;
    const icon1testId = 'icon-1';
    const icon2testId = 'icon-2';
    const item1 = { text: 'Item 1', icon: <span data-testid={icon1testId}>Icon1</span>, to: '/item-1' };
    const item2 = { text: 'Item 2', icon: <span data-testid={icon2testId}>Icon2</span>, to: '/item-2' };
    const menuList = [item1, item2];

    it('renders the list correctly', () => {
        render(
            <Sidebar
                drawerOpen={true}
                menuList={menuList}
                selectedMenuIndex={0}
                handleLogout={mockHandleLogout}
                drawerWidth={drawerWidth}
                userProfileLoaded={true}
            />
        );

        // Check if menu items are rendered with icons
        expect(screen.getByText(item1.text)).toBeInTheDocument();
        expect(screen.getByText(item2.text)).toBeInTheDocument();
        expect(screen.getByTestId(icon1testId)).toBeInTheDocument();
        expect(screen.getByTestId(icon2testId)).toBeInTheDocument();

        // Check if logout is rendered
        expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('highlights selected item', () => {
        render(
            <Sidebar
                drawerOpen={true}
                menuList={menuList}
                selectedMenuIndex={1}
                handleLogout={mockHandleLogout}
                drawerWidth={drawerWidth}
                userProfileLoaded={true}
            />
        );

        const renderedItem1 = screen.getByText(item1.text).closest('div[role="button"]');
        const renderedItem2 = screen.getByText(item2.text).closest('div[role="button"]');

        // Check if the correct item is highlighted
        expect(renderedItem1).not.toHaveClass('Mui-selected');
        expect(renderedItem2).toHaveClass('Mui-selected');
    });

    it('triggers handleLogout when logout button is clicked', () => {
        render(
            <Sidebar
                drawerOpen={true}
                menuList={menuList}
                selectedMenuIndex={0}
                handleLogout={mockHandleLogout}
                drawerWidth={drawerWidth}
                userProfileLoaded={true}
            />
        );

        // Trigger logout and check if the handler is called
        const logoutButton = screen.getByText('Logout');
        fireEvent.click(logoutButton);
        expect(mockHandleLogout).toHaveBeenCalledTimes(1);
    });

    it('navigates to correct items when clicked', () => {
        render(
            <Sidebar
                drawerOpen={true}
                menuList={menuList}
                selectedMenuIndex={0}
                handleLogout={mockHandleLogout}
                drawerWidth={drawerWidth}
                userProfileLoaded={true}
            />
        );

        // Click on the first item and check navigation
        const renderedItem2 = screen.getByText(item2.text);
        fireEvent.click(renderedItem2);
        expect(mockNavigate).toHaveBeenCalledWith('/item-2', { state: { lastLocation: '/current-path' } });
    });

    it('hides content when drawer is closed', () => {
        render(
            <Sidebar
                drawerOpen={false}
                menuList={menuList}
                selectedMenuIndex={0}
                handleLogout={mockHandleLogout}
                drawerWidth={drawerWidth}
                userProfileLoaded={true}
            />
        );

        // Persistent drawer keeps elements in DOM but hides them visually
        const renderedItem1 = screen.getByText(item1.text);
        expect(renderedItem1).toBeInTheDocument();
        expect(renderedItem1).not.toBeVisible();
    });

    it('shows loading state when user profile is not loaded', () => {
        render(
            <Sidebar
                drawerOpen={true}
                menuList={menuList}
                selectedMenuIndex={0}
                handleLogout={mockHandleLogout}
                drawerWidth={drawerWidth}
                userProfileLoaded={false}
            />
        );

        // Check if loading indicator is shown
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
});
