import { renderHook } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

describe('useLocalStorage', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        window.localStorage.clear();
        jest.clearAllMocks();
    });

    it('should return initial value when localStorage is empty', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
        expect(result.current[0]).toBe('initial');
    });

    it('should return a setter function', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
        expect(typeof result.current[1]).toBe('function');
    });

    it('should work with object values', () => {
        const initialValue = { name: 'test', count: 0 };
        const { result } = renderHook(() => useLocalStorage('object-key', initialValue));
        expect(result.current[0]).toEqual(initialValue);
    });

    it('should work with array values', () => {
        const initialValue = [1, 2, 3];
        const { result } = renderHook(() => useLocalStorage('array-key', initialValue));
        expect(result.current[0]).toEqual(initialValue);
    });

    it('should work with boolean values', () => {
        const { result } = renderHook(() => useLocalStorage('bool-key', true));
        expect(result.current[0]).toBe(true);
    });

    it('should work with null values', () => {
        const { result } = renderHook(() => useLocalStorage<string | null>('null-key', null));
        expect(result.current[0]).toBe(null);
    });
});
