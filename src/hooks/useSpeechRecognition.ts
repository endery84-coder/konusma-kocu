"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechRecognitionReturn {
    isListening: boolean;
    transcript: string;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
    error: string | null;
    isSupported: boolean;
}

export function useSpeechRecognition(lang: string = 'tr-TR'): UseSpeechRecognitionReturn {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(false);

    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                setIsSupported(true);
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = lang;

                recognition.onstart = () => {
                    setIsListening(true);
                    setError(null);
                };

                recognition.onend = () => {
                    setIsListening(false);
                };

                recognition.onerror = (event: any) => {
                    setError(event.error);
                    setIsListening(false);
                };

                recognition.onresult = (event: any) => {
                    let finalTranscript = '';
                    let interimTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        } else {
                            interimTranscript += event.results[i][0].transcript;
                        }
                    }

                    // We append only new final results to existing transcript?
                    // Actually, 'continuous' mode usually returns the whole session or chunks.
                    // A simple approach for react state:

                    const currentTranscript = Array.from(event.results)
                        .map((result: any) => result[0].transcript)
                        .join('');

                    setTranscript(currentTranscript);
                };

                recognitionRef.current = recognition;
            } else {
                setError("Tarayıcınız ses tanıma özelliğini desteklemiyor.");
            }
        }
    }, [lang]);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
            } catch {
                // Start error handled silently
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        isListening,
        transcript,
        startListening,
        stopListening,
        resetTranscript,
        error,
        isSupported
    };
}
