import {render, screen, fireEvent, within} from '@testing-library/react';
import {describe, it, expect, vi, beforeAll, afterAll} from 'vitest';
import '@testing-library/jest-dom';

import LocationAdminExplorer from './index';

const {
    admin0Name,
    admin0CountryCode,
    admin1Name,
    admin1Wiki,
    admin2Name,
    admin2Wiki,
    admin3Name,
    admin3Wiki
} = vi.hoisted(() => ({
    admin0Name: "United States of America",
    admin0CountryCode: "USA",
    admin1Name: "California",
    admin1Wiki: "Q99",
    admin2Name: "Los Angeles County",
    admin2Wiki: "Q104994",
    admin3Name: "Los Angeles",
    admin3Wiki: "Q65",
}));


// Mock the JSON data
vi.mock('../../data/adm1_parsed_data.json', () => ({
    default: {
        [admin0CountryCode]: [{"name": admin1Name, "wiki": admin1Wiki}]
    }
}));

vi.mock('../../data/adm2_parsed_data.json', () => ({
    default: {
        [admin1Wiki]: [{"name": admin2Name, "wiki": admin2Wiki}]
    }
}));

vi.mock('../../data/adm3_parsed_data.json', () => ({
    default: {
        [admin2Wiki]: [{"name": admin3Name, "wiki": admin3Wiki}]
    }
}));

describe('LocationAdminExplorer', () => {
    const originalWarn = console.warn.bind(console.warn)

    // Hide warnings about MUI anchorEl during tests
    beforeAll(() => {
        console.warn = (msg) =>
            !msg.toString().includes('MUI: The `anchorEl` prop provided to the component is invalid.') && originalWarn(msg)
    })
    afterAll(() => {
        console.warn = originalWarn
    })

    it('updates next level of admin when previous was selected', async () => {
        render(<LocationAdminExplorer/>);

        // Find Autocomplete fields
        const admin0Input = screen.getByLabelText(/Admin0/i);
        const admin1Input = screen.getByLabelText(/Admin1/i);
        const admin2Input = screen.getByLabelText(/Admin2/i);
        const admin3Input = screen.getByLabelText(/Admin3/i);

        // Select Admin0 area
        fireEvent.click(admin0Input);
        fireEvent.change(admin0Input, {target: {value: admin0Name}});
        fireEvent.click(await screen.findByText(admin0Name, {exact: false}));

        // Select Admin1 area
        fireEvent.click(admin1Input);
        fireEvent.keyDown(admin1Input, {key: 'ArrowDown'});
        fireEvent.click(await screen.findByText(admin1Name, {exact: false}));

        // Select Admin2 area
        fireEvent.click(admin2Input);
        fireEvent.keyDown(admin2Input, {key: 'ArrowDown'});
        fireEvent.click(await screen.findByText(admin2Name, {exact: false}));

        // Select Admin3 area
        fireEvent.click(admin3Input);
        fireEvent.keyDown(admin3Input, {key: 'ArrowDown'});
        fireEvent.click(await screen.findByText(admin3Name, {exact: false}));

        // Verify that all inputs have the correct values after selection
        expect((admin0Input as HTMLInputElement).value).toContain(admin0Name);
        expect((admin1Input as HTMLInputElement).value).toContain(admin1Name);
        expect((admin2Input as HTMLInputElement).value).toContain(admin2Name);
        expect((admin3Input as HTMLInputElement).value).toContain(admin3Name);

        // Verify that identifiers are displayed (e.g. ISO code for Admin0)
        expect(await screen.findByText(admin0CountryCode, {exact: false})).toBeInTheDocument();
        expect(await screen.findByText(admin1Wiki, {exact: false})).toBeInTheDocument();
        expect(await screen.findByText(admin2Wiki, {exact: false})).toBeInTheDocument();
        expect(await screen.findByText(admin3Wiki, {exact: false})).toBeInTheDocument();
    });

    it('removes selected value on clear', async () => {
        render(<LocationAdminExplorer/>);

        // Find Autocomplete fields
        const admin0Input = screen.getByLabelText(/Admin0/i);
        const admin1Input = screen.getByLabelText(/Admin1/i);
        const admin2Input = screen.getByLabelText(/Admin2/i);
        const admin3Input = screen.getByLabelText(/Admin3/i);

        // Select Admin0 area
        fireEvent.click(admin0Input);
        fireEvent.change(admin0Input, {target: {value: admin0Name}});
        fireEvent.click(await screen.findByText(admin0Name, {exact: false}));

        // Select Admin1 area
        fireEvent.click(admin1Input);
        fireEvent.keyDown(admin1Input, {key: 'ArrowDown'});
        fireEvent.click(await screen.findByText(admin1Name, {exact: false}));

        // Select Admin2 area
        fireEvent.click(admin2Input);
        fireEvent.keyDown(admin2Input, {key: 'ArrowDown'});
        fireEvent.click(await screen.findByText(admin2Name, {exact: false}));

        // Select Admin3 area
        fireEvent.click(admin3Input);
        fireEvent.keyDown(admin3Input, {key: 'ArrowDown'});
        fireEvent.click(await screen.findByText(admin3Name, {exact: false}));

        // Verify that all inputs have the correct values after selection
        expect((admin0Input as HTMLInputElement).value).toContain(admin0Name);
        expect((admin1Input as HTMLInputElement).value).toContain(admin1Name);
        expect((admin2Input as HTMLInputElement).value).toContain(admin2Name);
        expect((admin3Input as HTMLInputElement).value).toContain(admin3Name);

        // Clear Admin3 area
        const admin3Container = admin3Input.parentElement as HTMLElement;
        const clearButton3 = within(admin3Container).getByTitle('Clear');
        fireEvent.click(clearButton3);
        expect((admin3Input as HTMLInputElement).value).toBe('');
        expect((admin2Input as HTMLInputElement).value).toContain(admin2Name);

        // Clear Admin2 area
        const admin2Container = admin2Input.parentElement as HTMLElement;
        const clearButton2 = within(admin2Container).getByTitle('Clear');
        fireEvent.click(clearButton2);
        expect((admin2Input as HTMLInputElement).value).toBe('');
        expect((admin3Input as HTMLInputElement).value).toBe('');
        expect((admin1Input as HTMLInputElement).value).toContain(admin1Name);

        // Clear Admin1 area
        const admin1Container = admin1Input.parentElement as HTMLElement;
        const clearButton1 = within(admin1Container).getByTitle('Clear');
        fireEvent.click(clearButton1);
        expect((admin1Input as HTMLInputElement).value).toBe('');
        expect((admin2Input as HTMLInputElement).value).toBe('');
        expect((admin0Input as HTMLInputElement).value).toContain(admin0Name);
    });
});
