"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { METRONOME_DEFAULTS } from '@/lib/constants';

/**
 * Return type for the useMetronome hook
 * @interface UseMetronomeReturn
 */
interface UseMetronomeReturn {
    /** Whether the metronome is currently playing */
    isPlaying: boolean;
    /** Current beats per minute */
    bpm: number;
    /** Function to update the BPM value */
    setBpm: (bpm: number) => void;
    /** Starts the metronome */
    start: () => void;
    /** Stops the metronome */
    stop: () => void;
    /** Current beat position (0-3 for 4/4 time) */
    currentBeat: number;
}

/**
 * Metronome hook for rhythm and pacing exercises.
 * Provides a configurable audio metronome with visual beat tracking.
 * Useful for speech therapy to practice speaking at a consistent pace.
 * 
 * @returns {UseMetronomeReturn} Object containing metronome state and controls
 * @example
 * ```tsx
 * const { isPlaying, bpm, setBpm, start, stop, currentBeat } = useMetronome();
 * 
 * // Start at 60 BPM
 * start();
 * 
 * // Speed up to 80 BPM
 * setBpm(80);
 * 
 * // Stop when done
 * stop();
 * ```
 */
export function useMetronome(): UseMetronomeReturn {
    const [isPlaying, setIsPlaying] = useState(false);
    const [bpm, setBpm] = useState<number>(METRONOME_DEFAULTS.DEFAULT_BPM);
    const [currentBeat, setCurrentBeat] = useState(0);

    const audioContextRef = useRef<AudioContext | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const beatCountRef = useRef(0);

    const playClick = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const ctx = audioContextRef.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // Click sound
        oscillator.frequency.value = beatCountRef.current % METRONOME_DEFAULTS.BEATS_PER_MEASURE === 0 ? 1000 : 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);

        beatCountRef.current++;
        setCurrentBeat(beatCountRef.current % METRONOME_DEFAULTS.BEATS_PER_MEASURE);
    }, []);

    const start = useCallback(() => {
        if (isPlaying) return;

        setIsPlaying(true);
        beatCountRef.current = 0;
        setCurrentBeat(0);

        const intervalMs = (60 / bpm) * 1000;
        playClick(); // Play first click immediately

        intervalRef.current = setInterval(() => {
            playClick();
        }, intervalMs);
    }, [bpm, isPlaying, playClick]);

    const stop = useCallback(() => {
        setIsPlaying(false);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        beatCountRef.current = 0;
        setCurrentBeat(0);
    }, []);

    // Update interval when BPM changes while playing
    useEffect(() => {
        if (isPlaying) {
            stop();
            start();
        }
    }, [bpm]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    return {
        isPlaying,
        bpm,
        setBpm,
        start,
        stop,
        currentBeat,
    };
}
