"use client";

import { useState, useEffect } from 'react';

/**
 * Persistent state hook using localStorage.
 * Works like useState but persists the value to localStorage.
 * Handles SSR gracefully by initializing on client-side mount.
 * 
 * @template T - The type of the stored value
 * @param {string} key - The localStorage key to use
 * @param {T} initialValue - The initial value if no stored value exists
 * @returns {[T, (value: T | ((val: T) => T)) => void]} Tuple of [value, setValue]
 * @example
 * ```tsx
 * const [theme, setTheme] = useLocalStorage('theme', 'dark');
 * 
 * // Update theme
 * setTheme('light');
 * 
 * // Use callback form
 * setTheme(prev => prev === 'dark' ? 'light' : 'dark');
 * ```
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState<T>(initialValue);

    // Initialize state on mount (client-side only to avoid hydration mismatch)
    useEffect(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item));
            }
        } catch {
            // Silent fail for localStorage
        }
    }, [key]);

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;
            // Save state
            setStoredValue(valueToStore);
            // Save to local storage
            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch {
            // Silent fail for localStorage
        }
    };

    return [storedValue, setValue];
}
