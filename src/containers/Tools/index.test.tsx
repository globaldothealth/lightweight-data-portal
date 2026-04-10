import { render, screen } from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import Tools from './index';

describe('Tools Component', () => {
    it('renders the main heading', () => {
        render(<Tools />);
        const heading = screen.getByRole('heading', { name: /tools/i, level: 2 });
        expect(heading).toBeInTheDocument();
    });

    it('renders the introductory text', () => {
        render(<Tools />);
        const introText = screen.getByText(/Explore tools from the Global.health team/i);
        expect(introText).toBeInTheDocument();
    });

    it('renders all tool cards with correct images, links, and descriptions', () => {
        render(<Tools />);

        const toolsData = [
            {
                name: 'Grapevne',
                link: 'https://dev-globalhealth.pantheonsite.io/tools/grapevne/',
                description: /A graphical platform for building and validating/i
            },
            {
                name: 'DART',
                link: 'https://dev-globalhealth.pantheonsite.io/tools/dart/',
                description: /Scalable, open-access and multidisciplinary/i
            },
            {
                name: 'Insight Board',
                link: 'https://dev-globalhealth.pantheonsite.io/tools/insightboard/',
                description: /Open-source AI-assisted tool for integrating/i
            }
        ];

        toolsData.forEach(tool => {
            // Check description
            expect(screen.getByText(tool.description)).toBeInTheDocument();

            // Check image alt text
            const image = screen.getByAltText(tool.name);
            expect(image).toBeInTheDocument();

            // Check anchor link wrapping the image
            const link = image.closest('a');
            expect(link).toHaveAttribute('href', tool.link);
            expect(link).toHaveAttribute('target', '_blank');
        });
    });
});
