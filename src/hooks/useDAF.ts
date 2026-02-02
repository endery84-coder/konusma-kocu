"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { DAF_DEFAULTS } from '@/lib/constants';

/**
 * Return type for the useDAF hook
 * @interface UseDAFReturn
 */
interface UseDAFReturn {
    /** Whether DAF is currently active */
    isActive: boolean;
    /** Current delay in milliseconds */
    delayMs: number;
    /** Function to update the delay value */
    setDelayMs: (ms: number) => void;
    /** Starts the DAF audio processing */
    startDAF: () => Promise<void>;
    /** Stops the DAF audio processing and cleans up resources */
    stopDAF: () => void;
    /** Error message if DAF fails to start */
    error: string | null;
}

/**
 * Delayed Auditory Feedback (DAF) hook for speech therapy.
 * DAF plays back the user's voice with a configurable delay,
 * which can help reduce stuttering and improve speech fluency.
 * 
 * @returns {UseDAFReturn} Object containing DAF state and control functions
 * @example
 * ```tsx
 * const { isActive, delayMs, setDelayMs, startDAF, stopDAF, error } = useDAF();
 * 
 * // Start DAF with 100ms delay
 * await startDAF();
 * 
 * // Adjust delay in real-time
 * setDelayMs(150);
 * 
 * // Stop when done
 * stopDAF();
 * ```
 */
export function useDAF(): UseDAFReturn {
    const [isActive, setIsActive] = useState(false);
    const [delayMs, setDelayMs] = useState<number>(DAF_DEFAULTS.DEFAULT_DELAY_MS);
    const [error, setError] = useState<string | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const delayNodeRef = useRef<DelayNode | null>(null);

    const startDAF = useCallback(async () => {
        try {
            setError(null);

            // Get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false, // Important for DAF
                    noiseSuppression: false,
                    autoGainControl: false,
                }
            });

            streamRef.current = stream;

            // Create audio context
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = audioContext;

            // Create nodes
            const source = audioContext.createMediaStreamSource(stream);
            sourceRef.current = source;

            const delayNode = audioContext.createDelay(1.0); // Max 1 second delay
            delayNode.delayTime.value = delayMs / 1000;
            delayNodeRef.current = delayNode;

            // Connect: microphone -> delay -> speakers
            source.connect(delayNode);
            delayNode.connect(audioContext.destination);

            setIsActive(true);
        } catch {
            setError('DAF başlatılamadı. Mikrofon izni gerekli.');
        }
    }, [delayMs]);

    const stopDAF = useCallback(() => {
        // Disconnect nodes
        if (sourceRef.current) {
            sourceRef.current.disconnect();
            sourceRef.current = null;
        }

        if (delayNodeRef.current) {
            delayNodeRef.current.disconnect();
            delayNodeRef.current = null;
        }

        // Close audio context
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        // Stop stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        setIsActive(false);
    }, []);

    // Update delay in real-time
    useEffect(() => {
        if (delayNodeRef.current && isActive) {
            delayNodeRef.current.delayTime.value = delayMs / 1000;
        }
    }, [delayMs, isActive]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopDAF();
        };
    }, [stopDAF]);

    return {
        isActive,
        delayMs,
        setDelayMs,
        startDAF,
        stopDAF,
        error,
    };
}
