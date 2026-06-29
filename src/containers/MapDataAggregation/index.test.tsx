import {render, screen, within, waitFor} from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import userEvent from '@testing-library/user-event';

import MapDataAggregation from './index';
import * as reduxHooks from '../../hooks/redux';
import {
    selectScheduleConfigs,
    selectIsLoading,
    selectError,
} from '../../redux/mapDataAggregation/selectors';
import * as thunks from '../../redux/mapDataAggregation/thunk';
import {OUTBREAK_OPTIONS} from '../../config/outbreaks';
import {ScheduleConfig} from '../../models/ScheduleConfig';

// Mock the thunks
vi.mock('../../redux/mapDataAggregation/thunk', () => ({
    getScheduleConfigs: vi.fn(),
    createScheduleConfig: vi.fn(),
    deleteScheduleConfig: vi.fn(),
}));

// Mock Redux hooks
vi.mock('../../hooks/redux', () => ({
    useAppDispatch: vi.fn(),
    useAppSelector: vi.fn(),
}));

// Mock selectors
vi.mock('../../redux/mapDataAggregation/selectors', () => ({
    selectScheduleConfigs: vi.fn(),
    selectIsLoading: vi.fn(),
    selectError: vi.fn(),
}));

describe('MapDataAggregation Container', () => {
    const mockDispatch = vi.fn();
    const outbreak = OUTBREAK_OPTIONS[0];

    interface SelectorOverrides {
        configs?: ScheduleConfig[];
        isLoading?: boolean;
        error?: string;
    }

    // Configure the mocked useAppSelector to return values for each selector
    const setupSelectors = ({configs = [], isLoading = false, error = undefined}: SelectorOverrides = {}) => {
        vi.mocked(reduxHooks.useAppSelector).mockImplementation((selector) => {
            if (selector === selectScheduleConfigs) return configs;
            if (selector === selectIsLoading) return isLoading;
            if (selector === selectError) return error;
            return undefined;
        });
    };

    // The MUI Selects in this component don't link their labels to the input,
    // so they have no accessible name. Locate the combobox via its label's FormControl instead.
    const getCombobox = (labelText: RegExp): HTMLElement => {
        const label = screen.getByText(labelText, {selector: 'label'});
        const formControl = label.closest('.MuiFormControl-root');
        if (!formControl) throw new Error(`Could not find a FormControl for label ${labelText}`);
        return within(formControl as HTMLElement).getByRole('combobox');
    };

    // Helper to choose an option from a (non-native) MUI Select
    const selectOption = async (
        user: ReturnType<typeof userEvent.setup>,
        comboboxLabel: RegExp,
        optionName: RegExp | string,
    ) => {
        await user.click(getCombobox(comboboxLabel));
        const listbox = await screen.findByRole('listbox');
        await user.click(within(listbox).getByRole('option', {name: optionName}));
        // Wait for the menu to fully close before the next interaction
        await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    };

    beforeEach(() => {
        vi.resetAllMocks();
        vi.mocked(reduxHooks.useAppDispatch).mockReturnValue(mockDispatch);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(thunks.getScheduleConfigs).mockReturnValue({type: 'test-get-configs'} as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(thunks.createScheduleConfig).mockReturnValue({type: 'test-create-config'} as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(thunks.deleteScheduleConfig).mockReturnValue({type: 'test-delete-config'} as any);
    });

    it('fetches schedule configurations on mount and renders the title', () => {
        setupSelectors();
        render(<MapDataAggregation/>);

        // getScheduleConfigs action is dispatched on mount
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({type: 'test-get-configs'}));
        expect(thunks.getScheduleConfigs).toHaveBeenCalled();
        expect(screen.getByRole('heading', {name: 'Map Data Aggregation'})).toBeInTheDocument();
    });

    it('shows the empty state when there are no configurations', () => {
        setupSelectors({configs: []});
        render(<MapDataAggregation/>);

        expect(screen.getByText('No schedule configurations found.')).toBeInTheDocument();
    });

    it('shows a loading indicator while loading', () => {
        setupSelectors({isLoading: true});
        render(<MapDataAggregation/>);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        // Empty-state message is hidden while loading
        expect(screen.queryByText('No schedule configurations found.')).not.toBeInTheDocument();
    });

    it('renders an error alert when there is an error', () => {
        setupSelectors({error: 'Something went wrong'});
        render(<MapDataAggregation/>);

        expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    });

    it('renders existing configurations with their status and schedule', () => {
        const configs: ScheduleConfig[] = [
            {id: '1', outbreakName: outbreak, scheduleExpression: 'rate(30 minutes)', enabled: true}
        ];
        setupSelectors({configs});
        render(<MapDataAggregation/>);

        const list = screen.getByRole('list');
        expect(within(list).getByText(outbreak)).toBeInTheDocument();
        expect(within(list).getByText(/rate\(30 minutes\)/)).toBeInTheDocument();
        expect(within(list).getByText('Enabled')).toBeInTheDocument();
    });

    it('dispatches deleteScheduleConfig when the delete button is clicked', async () => {
        const user = userEvent.setup({pointerEventsCheck: 0});
        const configs: ScheduleConfig[] = [
            {id: 'config-1', outbreakName: outbreak, scheduleExpression: 'rate(30 minutes)', enabled: true},
        ];
        setupSelectors({configs});
        render(<MapDataAggregation/>);

        await user.click(screen.getByRole('button', {name: 'delete'}));

        expect(thunks.deleteScheduleConfig).toHaveBeenCalledWith('config-1');
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({type: 'test-delete-config'}));
    });

    it('disables the submit button until an outbreak is selected', async () => {
        const user = userEvent.setup({pointerEventsCheck: 0});
        setupSelectors({configs: []});
        render(<MapDataAggregation/>);

        const submitButton = screen.getByRole('button', {name: /add configuration/i});
        expect(submitButton).toBeDisabled();

        await selectOption(user, /outbreak name/i, outbreak);

        expect(submitButton).toBeEnabled();
    });

    it('creates a configuration with a rate schedule expression', async () => {
        const user = userEvent.setup({pointerEventsCheck: 0});
        setupSelectors({configs: []});
        render(<MapDataAggregation/>);

        await selectOption(user, /outbreak name/i, outbreak);
        await user.click(screen.getByRole('button', {name: /add configuration/i}));

        expect(thunks.createScheduleConfig).toHaveBeenCalledWith({
            scheduleExpression: 'rate(30 minutes)',
            outbreakName: outbreak,
            enabled: true,
        });

        // Form resets after submit -> submit button becomes disabled again
        await waitFor(() =>
            expect(screen.getByRole('button', {name: /add configuration/i})).toBeDisabled(),
        );
    });

    it('uses a singular unit when the rate value is one', async () => {
        const user = userEvent.setup({pointerEventsCheck: 0});
        setupSelectors({configs: []});
        render(<MapDataAggregation/>);

        await selectOption(user, /outbreak name/i, outbreak);
        const valueInput = screen.getByRole('spinbutton', {name: /value/i});
        await user.clear(valueInput);
        await user.type(valueInput, '1');

        await user.click(screen.getByRole('button', {name: /add configuration/i}));

        expect(thunks.createScheduleConfig).toHaveBeenCalledWith({
            scheduleExpression: 'rate(1 minute)',
            outbreakName: outbreak,
            enabled: true,
        });
    });

    it('creates a configuration with the selected rate unit', async () => {
        const user = userEvent.setup({pointerEventsCheck: 0});
        setupSelectors({configs: []});
        render(<MapDataAggregation/>);

        await selectOption(user, /outbreak name/i, outbreak);
        await selectOption(user, /unit/i, 'Hours');

        await user.click(screen.getByRole('button', {name: /add configuration/i}));

        expect(thunks.createScheduleConfig).toHaveBeenCalledWith({
            scheduleExpression: 'rate(30 hours)',
            outbreakName: outbreak,
            enabled: true,
        });
    });

    it('creates a configuration with a cron schedule expression', async () => {
        const user = userEvent.setup({pointerEventsCheck: 0});
        setupSelectors({configs: []});
        render(<MapDataAggregation/>);

        await selectOption(user, /outbreak name/i, outbreak);
        await selectOption(user, /schedule type/i, 'Cron');

        // The rate inputs are replaced by the cron expression field
        expect(screen.queryByRole('spinbutton', {name: /value/i})).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', {name: /add configuration/i}));

        expect(thunks.createScheduleConfig).toHaveBeenCalledWith({
            scheduleExpression: 'cron(0 0 * * ? *)',
            outbreakName: outbreak,
            enabled: true,
        });
    });

    it('disables outbreaks that already have a schedule and shows a message when all are used', async () => {
        const user = userEvent.setup({pointerEventsCheck: 0});
        const configs: ScheduleConfig[] = OUTBREAK_OPTIONS.map((name, index) => ({
            id: `id-${index}`,
            outbreakName: name,
            scheduleExpression: 'rate(30 minutes)',
            enabled: true,
        }));
        setupSelectors({configs});
        render(<MapDataAggregation/>);

        expect(screen.getByText('All outbreaks already have an active schedule.')).toBeInTheDocument();

        // The already-scheduled outbreak option is disabled in the dropdown
        await user.click(getCombobox(/outbreak name/i));
        const option = await screen.findByRole('option', {name: `${outbreak} (already scheduled)`});
        expect(option).toHaveAttribute('aria-disabled', 'true');
    });
});
