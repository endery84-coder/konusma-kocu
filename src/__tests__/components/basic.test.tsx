import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the necessary modules
jest.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
            onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
        },
    },
}));

jest.mock('@/lib/i18n/LanguageContext', () => ({
    useLanguage: () => ({
        t: (key: string) => key,
        language: 'tr',
        setLanguage: jest.fn(),
    }),
    LanguageProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Simple component for testing
const TestComponent = () => {
    return <div data-testid="test">Hello Test</div>;
};

describe('Basic Component Rendering', () => {
    it('should render a simple component', () => {
        render(<TestComponent />);
        expect(screen.getByTestId('test')).toBeInTheDocument();
    });

    it('should have correct text content', () => {
        render(<TestComponent />);
        expect(screen.getByText('Hello Test')).toBeInTheDocument();
    });
});
