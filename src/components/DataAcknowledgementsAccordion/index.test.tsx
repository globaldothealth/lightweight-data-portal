import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { DataAcknowledgementsAccordion } from './index';

describe('DataAcknowledgementsAccordion', () => {
    it('renders closed by default when initialOpen is false', () => {
        render(<DataAcknowledgementsAccordion initialOpen={false} />);

        expect(screen.getByText(/By accessing or using the datasets/i)).toBeVisible();

        const contentText = screen.getByText(/By accessing or downloading these datasets/i);
        expect(contentText).not.toBeVisible();
    });

    it('renders open when initialOpen is true', () => {
        render(<DataAcknowledgementsAccordion initialOpen={true} />);

        const contentText = screen.getByText(/By accessing or downloading these datasets/i);
        expect(contentText).toBeVisible();
    });

    it('toggles visibility when link is clicked', async () => {
        render(<DataAcknowledgementsAccordion initialOpen={false} />);

        const contentText = screen.getByText(/By accessing or downloading these datasets/i);
        expect(contentText).not.toBeVisible();

        const link = screen.getByText(/data handling terms/i);
        fireEvent.click(link);

        await waitFor(() => expect(contentText).toBeVisible());

        fireEvent.click(link);
        await waitFor(() => expect(contentText).not.toBeVisible());
    });
});
