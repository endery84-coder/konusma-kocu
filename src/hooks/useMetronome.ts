"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { METRONOME_DEFAULTS } from '@/lib/constants';

interface UseMetronomeReturn {
    isPlaying: boolean;
    bpm: number;
    setBpm: (bpm: number) => void;
    start: () => void;
    stop: () => void;
    currentBeat: number;
}

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
