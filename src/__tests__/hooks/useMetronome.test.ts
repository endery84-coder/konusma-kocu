import { renderHook, act } from '@testing-library/react';
import { useMetronome } from '@/hooks/useMetronome';
import { METRONOME_DEFAULTS } from '@/lib/constants';

describe('useMetronome', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('should initialize with default values', () => {
        const { result } = renderHook(() => useMetronome());

        expect(result.current.isPlaying).toBe(false);
        expect(result.current.bpm).toBe(METRONOME_DEFAULTS.DEFAULT_BPM);
        expect(result.current.currentBeat).toBe(0);
    });

    it('should start playing when start is called', () => {
        const { result } = renderHook(() => useMetronome());

        act(() => {
            result.current.start();
        });

        expect(result.current.isPlaying).toBe(true);
    });

    it('should stop playing when stop is called', () => {
        const { result } = renderHook(() => useMetronome());

        act(() => {
            result.current.start();
        });

        expect(result.current.isPlaying).toBe(true);

        act(() => {
            result.current.stop();
        });

        expect(result.current.isPlaying).toBe(false);
        expect(result.current.currentBeat).toBe(0);
    });

    it('should update BPM when setBpm is called', () => {
        const { result } = renderHook(() => useMetronome());

        act(() => {
            result.current.setBpm(120);
        });

        expect(result.current.bpm).toBe(120);
    });

    it('should increment currentBeat on each tick', () => {
        const { result } = renderHook(() => useMetronome());

        act(() => {
            result.current.start();
        });

        // Initial beat is 0, after first click it becomes 1
        expect(result.current.currentBeat).toBe(1);

        // Advance timer to next beat (at 60 BPM, interval is 1000ms)
        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(result.current.currentBeat).toBe(2);
    });

    it('should wrap currentBeat to 0 after BEATS_PER_MEASURE', () => {
        const { result } = renderHook(() => useMetronome());

        act(() => {
            result.current.start();
        });

        // Advance through all beats
        for (let i = 0; i < METRONOME_DEFAULTS.BEATS_PER_MEASURE - 1; i++) {
            act(() => {
                jest.advanceTimersByTime(1000);
            });
        }

        // Should wrap back to 0 after 4 beats
        expect(result.current.currentBeat).toBe(0);
    });
});
