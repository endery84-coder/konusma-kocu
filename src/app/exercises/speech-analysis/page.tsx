"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mic, Square, RefreshCcw, BarChart2, MessageSquare, Clock, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { analyzeSpeech, SpeechAnalysisResult } from '@/lib/speechAnalysis';

const LANG_MAP: Record<string, string> = {
    tr: 'tr-TR',
    en: 'en-US',
    de: 'de-DE',
    es: 'es-ES',
    fr: 'fr-FR',
    it: 'it-IT',
    ru: 'ru-RU',
    ar: 'ar-SA',
    fa: 'fa-IR',
};

export default function SpeechAnalysisPage() {
    const router = useRouter();
    const { t, language } = useLanguage();

    // Timer State
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Speech Hook
    const recognitionLang = LANG_MAP[language] || 'en-US';
    const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported, error } = useSpeechRecognition(recognitionLang);

    // Analysis State
    const [result, setResult] = useState<SpeechAnalysisResult | null>(null);

    // Timer Logic
    useEffect(() => {
        if (isListening) {
            timerRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isListening]);

    const handleStart = () => {
        setResult(null);
        resetTranscript();
        setElapsedTime(0);
        startListening();
    };

    const handleStop = () => {
        stopListening();
        // Analyze immediately
        // Note: transcript might have slight delay in updating final bit, but usually ok.
        setTimeout(() => {
            const analysis = analyzeSpeech(transcript, elapsedTime, language);
            setResult(analysis);
        }, 500);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-background pb-safe">
            {/* Header */}
            <div className="sticky top-0 z-10 glass border-b border-border">
                <div className="flex items-center gap-4 p-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-xl transition-colors">
                        <ArrowLeft className="w-5 h-5 text-foreground rtl-flip" />
                    </button>
                    <h1 className="text-xl font-bold text-foreground">{t('exercises.analysis.title')}</h1>
                </div>
            </div>

            <div className="p-4 flex flex-col items-center gap-6 max-w-2xl mx-auto">
                {/* Error Banner */}
                {(!isSupported || error) && (
                    <div className="w-full p-4 bg-red-500/10 text-red-500 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        <p className="text-sm font-medium">
                            {!isSupported ? t('exercises.analysis.browserNotSupported') : t('exercises.analysis.microphoneError')}
                        </p>
                    </div>
                )}

                {/* Main Visual / Timer */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                    <motion.div
                        animate={{ scale: isListening ? [1, 1.1, 1] : 1 }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className={`absolute inset-0 rounded-full opacity-20 ${isListening ? 'bg-primary' : 'bg-secondary'}`}
                    />
                    <div className="relative z-10 text-4xl font-bold font-mono text-foreground">
                        {formatTime(elapsedTime)}
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6">
                    {!isListening ? (
                        <button
                            onClick={handleStart}
                            disabled={!isSupported}
                            className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all text-primary-foreground disabled:opacity-50"
                        >
                            <Mic className="w-8 h-8" />
                        </button>
                    ) : (
                        <button
                            onClick={handleStop}
                            className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30 hover:scale-105 active:scale-95 transition-all text-white"
                        >
                            <Square className="w-6 h-6 fill-current" />
                        </button>
                    )}
                </div>

                {/* Live Transcript Area */}
                <div className="w-full bg-card border border-border rounded-2xl p-6 min-h-[150px] shadow-sm">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        {t('exercises.analysis.liveTranscript')} ({recognitionLang})
                    </h3>
                    <p className="text-lg text-foreground leading-relaxed whitespace-pre-wrap">
                        {transcript || <span className="text-muted-foreground italic opacity-50">{t('exercises.analysis.transcriptPlaceholder')}</span>}
                    </p>
                </div>

                {/* Results Card */}
                <AnimatePresence>
                    {result && !isListening && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full"
                        >
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-card p-4 rounded-xl border border-border text-center">
                                    <div className="text-2xl font-bold text-primary">{result.score}</div>
                                    <div className="text-xs text-muted-foreground">{t('exercises.analysis.score')}</div>
                                </div>
                                <div className="bg-card p-4 rounded-xl border border-border text-center">
                                    <div className="text-2xl font-bold text-blue-500">{result.wpm}</div>
                                    <div className="text-xs text-muted-foreground">{t('exercises.analysis.wpm')}</div>
                                </div>
                                <div className="bg-card p-4 rounded-xl border border-border text-center">
                                    <div className="text-2xl font-bold text-orange-500">{result.fillerCount}</div>
                                    <div className="text-xs text-muted-foreground">{t('exercises.analysis.fillerCount')}</div>
                                </div>
                                <div className="bg-card p-4 rounded-xl border border-border text-center">
                                    <div className="text-2xl font-bold text-emerald-500">{result.wordCount}</div>
                                    <div className="text-xs text-muted-foreground">{t('exercises.analysis.wordCount')}</div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-xl border border-primary/20">
                                <h3 className="font-semibold text-primary mb-1">{t('exercises.analysis.aiComment')}</h3>
                                <p className="text-foreground text-sm">{result.feedback}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

