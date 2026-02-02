"use client";

import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Return type for the useAudioRecorder hook
 * @interface UseAudioRecorderReturn
 */
interface UseAudioRecorderReturn {
    /** Whether recording is in progress */
    isRecording: boolean;
    /** Whether recording is paused */
    isPaused: boolean;
    /** Current recording duration in seconds */
    recordingTime: number;
    /** URL to the recorded audio blob (for playback) */
    audioURL: string | null;
    /** The recorded audio as a Blob */
    audioBlob: Blob | null;
    /** Starts a new recording session */
    startRecording: () => Promise<void>;
    /** Stops the current recording and saves the audio */
    stopRecording: () => void;
    /** Pauses the current recording */
    pauseRecording: () => void;
    /** Resumes a paused recording */
    resumeRecording: () => void;
    /** Resets/clears the recorded audio */
    resetRecording: () => void;
    /** Error message if recording fails */
    error: string | null;
}

/**
 * Audio recording hook with pause/resume functionality.
 * Captures audio from the user's microphone and provides
 * playback and download capabilities.
 * 
 * @returns {UseAudioRecorderReturn} Object containing recording state and controls
 * @example
 * ```tsx
 * const { 
 *   isRecording, 
 *   recordingTime, 
 *   audioURL, 
 *   startRecording, 
 *   stopRecording 
 * } = useAudioRecorder();
 * 
 * // Start recording
 * await startRecording();
 * 
 * // Stop after some time
 * stopRecording();
 * 
 * // Play back the recording
 * if (audioURL) {
 *   const audio = new Audio(audioURL);
 *   audio.play();
 * }
 * ```
 */
export function useAudioRecorder(): UseAudioRecorderReturn {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startRecording = useCallback(async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100,
                }
            });

            streamRef.current = stream;
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioURL(url);

                // Stop all tracks
                streamRef.current?.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start(100); // Collect data every 100ms
            setIsRecording(true);
            setIsPaused(false);
            setRecordingTime(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err: any) {
            if (err.name === 'NotAllowedError') {
                setError('Mikrofon izni verilmedi. Lütfen tarayıcı ayarlarından izin verin.');
            } else if (err.name === 'NotFoundError') {
                setError('Mikrofon bulunamadı. Lütfen bir mikrofon bağlayın.');
            } else {
                setError('Kayıt başlatılamadı. Lütfen tekrar deneyin.');
            }
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);

            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, [isRecording]);

    const pauseRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording && !isPaused) {
            mediaRecorderRef.current.pause();
            setIsPaused(true);

            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, [isRecording, isPaused]);

    const resumeRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording && isPaused) {
            mediaRecorderRef.current.resume();
            setIsPaused(false);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
    }, [isRecording, isPaused]);

    const resetRecording = useCallback(() => {
        if (audioURL) {
            URL.revokeObjectURL(audioURL);
        }
        setAudioURL(null);
        setAudioBlob(null);
        setRecordingTime(0);
        setError(null);
        audioChunksRef.current = [];
    }, [audioURL]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (audioURL) {
                URL.revokeObjectURL(audioURL);
            }
            streamRef.current?.getTracks().forEach(track => track.stop());
        };
    }, [audioURL]);

    return {
        isRecording,
        isPaused,
        recordingTime,
        audioURL,
        audioBlob,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        resetRecording,
        error,
    };
}
