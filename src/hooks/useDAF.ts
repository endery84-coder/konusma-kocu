"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { DAF_DEFAULTS } from '@/lib/constants';

interface UseDAFReturn {
    isActive: boolean;
    delayMs: number;
    setDelayMs: (ms: number) => void;
    startDAF: () => Promise<void>;
    stopDAF: () => void;
    error: string | null;
}

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
