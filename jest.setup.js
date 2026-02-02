require('@testing-library/jest-dom');

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
    }),
    usePathname: () => '/',
    useParams: () => ({}),
    useSearchParams: () => new URLSearchParams(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => {
    const React = require('react');
    return {
        motion: {
            div: React.forwardRef((props, ref) => React.createElement('div', { ...props, ref })),
            button: React.forwardRef((props, ref) => React.createElement('button', { ...props, ref })),
            span: React.forwardRef((props, ref) => React.createElement('span', { ...props, ref })),
            p: React.forwardRef((props, ref) => React.createElement('p', { ...props, ref })),
            h1: React.forwardRef((props, ref) => React.createElement('h1', { ...props, ref })),
            h2: React.forwardRef((props, ref) => React.createElement('h2', { ...props, ref })),
            h3: React.forwardRef((props, ref) => React.createElement('h3', { ...props, ref })),
            section: React.forwardRef((props, ref) => React.createElement('section', { ...props, ref })),
            article: React.forwardRef((props, ref) => React.createElement('article', { ...props, ref })),
            nav: React.forwardRef((props, ref) => React.createElement('nav', { ...props, ref })),
        },
        AnimatePresence: ({ children }) => children,
    };
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
    observe = jest.fn();
    disconnect = jest.fn();
    unobserve = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
});

// Mock ResizeObserver
class MockResizeObserver {
    observe = jest.fn();
    disconnect = jest.fn();
    unobserve = jest.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: MockResizeObserver,
});

// Mock AudioContext
class MockAudioContext {
    createOscillator = jest.fn(() => ({
        connect: jest.fn(),
        start: jest.fn(),
        stop: jest.fn(),
        frequency: { value: 0 },
        type: 'sine',
    }));
    createGain = jest.fn(() => ({
        connect: jest.fn(),
        gain: {
            value: 1,
            setValueAtTime: jest.fn(),
            exponentialRampToValueAtTime: jest.fn(),
        },
    }));
    createMediaStreamSource = jest.fn(() => ({
        connect: jest.fn(),
        disconnect: jest.fn(),
    }));
    createDelay = jest.fn(() => ({
        connect: jest.fn(),
        disconnect: jest.fn(),
        delayTime: { value: 0 },
    }));
    createAnalyser = jest.fn(() => ({
        connect: jest.fn(),
        disconnect: jest.fn(),
        fftSize: 256,
        frequencyBinCount: 128,
        getByteFrequencyData: jest.fn(),
    }));
    destination = {};
    currentTime = 0;
    close = jest.fn();
}

Object.defineProperty(window, 'AudioContext', {
    writable: true,
    configurable: true,
    value: MockAudioContext,
});

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
    writable: true,
    value: {
        getUserMedia: jest.fn().mockResolvedValue({
            getTracks: () => [{ stop: jest.fn() }],
        }),
    },
});
