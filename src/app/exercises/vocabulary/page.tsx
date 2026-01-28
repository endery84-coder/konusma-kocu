"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mic, Play, RotateCcw, Volume2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { vocabularyWords } from '@/lib/data/vocabulary';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

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

export default function VocabularyCoachPage() {
    const router = useRouter();
    const { t, language } = useLanguage();
    const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
    const [words, setWords] = useState<string[]>([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState<string | null>(null);

    const recognitionLang = LANG_MAP[language] || 'en-US';
    const { isListening, transcript, startListening, stopListening, resetTranscript } = useSpeechRecognition(recognitionLang);

    useEffect(() => {
        // Load words for current lang & level
        const langData = vocabularyWords[language as keyof typeof vocabularyWords] || vocabularyWords['en'];
        const levelWords = langData[level] || langData['beginner'];
        setWords(levelWords);
        setCurrentWordIndex(0);
        setScore(0);
        setFeedback(null);
    }, [language, level]);

    const handleSpeak = () => {
        if (isListening) {
            stopListening();
            checkPronunciation();
        } else {
            resetTranscript();
            setFeedback(null);
            startListening();
        }
    };

    const checkPronunciation = () => {
        setTimeout(() => {
            const target = words[currentWordIndex].toLowerCase();
            const spoken = transcript.toLowerCase(); // simplified

            if (spoken.includes(target) || (target.length > 5 && spoken.includes(target.substring(0, target.length - 1)))) {
                setFeedback("correct");
                setScore(s => s + 10);
                setTimeout(nextWord, 1500);
            } else {
                setFeedback("incorrect");
            }
        }, 500);
    };

    const nextWord = () => {
        setFeedback(null);
        resetTranscript();
        if (currentWordIndex < words.length - 1) {
            setCurrentWordIndex(prev => prev + 1);
        } else {
            setFeedback("coaching_complete");
        }
    };

    const playPronunciation = () => {
        // Utilizes browser TTS
        const word = words[currentWordIndex];
        const utter = new SpeechSynthesisUtterance(word);
        utter.lang = recognitionLang;
        window.speechSynthesis.speak(utter);
    };

    return (
        <div className="min-h-screen bg-background pb-safe flex flex-col">
            {/* Header */}
            <div className="w-full px-6 py-4 flex justify-between items-center bg-card border-b border-border">
                <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-xl transition-colors">
                    <ArrowLeft className="w-5 h-5 text-foreground rtl-flip" />
                </button>
                <h1 className="font-bold text-foreground">Kelime Koçu</h1>
                <div className="w-8" />
            </div>

            <div className="flex-1 flex flex-col items-center p-6 max-w-md mx-auto w-full gap-8">

                {/* Level Selector */}
                <div className="flex bg-secondary rounded-xl p-1 w-full">
                    {(['beginner', 'intermediate', 'advanced'] as const).map((l) => (
                        <button
                            key={l}
                            onClick={() => setLevel(l)}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${level === l ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            {l === 'beginner' ? 'Başlangıç' : l === 'intermediate' ? 'Orta' : 'İleri'}
                        </button>
                    ))}
                </div>

                {/* Word Card */}
                <div className="relative w-full aspect-square bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl border border-primary/20 flex flex-col items-center justify-center p-8 shadow-xl">
                    <AnimatePresence mode='wait'>
                        {feedback === 'coaching_complete' ? (
                            <motion.div
                                key="complete"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center"
                            >
                                <div className="text-6xl mb-4">🎉</div>
                                <h2 className="text-2xl font-bold text-primary mb-2">Harika İş!</h2>
                                <p className="text-muted-foreground">Tüm kelimeleri tamamladın.</p>
                                <div className="mt-6 text-4xl font-black text-foreground">{score} Puan</div>
                                <button onClick={() => { setCurrentWordIndex(0); setScore(0); setFeedback(null); }} className="mt-8 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:shadow-lg transition-all">
                                    Tekrarla
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={words[currentWordIndex]}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                className="flex flex-col items-center gap-6"
                            >
                                <div className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Hedef Kelime</div>
                                <h2 className="text-5xl md:text-6xl font-black text-foreground tracking-tight text-center break-words w-full">
                                    {words[currentWordIndex]}
                                </h2>

                                <button
                                    onClick={playPronunciation}
                                    className="p-3 bg-secondary rounded-full hover:bg-secondary/80 transition-colors text-primary"
                                >
                                    <Volume2 className="w-6 h-6" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Feedback Overlay */}
                    {feedback === 'correct' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-green-500/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                            <div className="bg-white text-green-600 p-4 rounded-full shadow-lg">
                                <Play className="w-8 h-8 fill-current" />
                            </div>
                        </motion.div>
                    )}
                    {feedback === 'incorrect' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-red-500/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
                            <div className="bg-white text-red-600 p-4 rounded-full shadow-lg">
                                <RotateCcw className="w-8 h-8" />
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Status */}
                <div className="flex justify-between w-full px-4 text-sm font-medium text-muted-foreground">
                    <span>Kelime {feedback !== 'coaching_complete' ? currentWordIndex + 1 : words.length} / {words.length}</span>
                    <span>Skor: {score}</span>
                </div>

                {/* Controls */}
                {feedback !== 'coaching_complete' && (
                    <div className="w-full flex justify-center pb-8">
                        <button
                            onClick={handleSpeak}
                            className={`
                                  w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all relative overflow-hidden
                                  ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}
                              `}
                        >
                            <div className={`absolute inset-0 bg-white/20 rounded-full ${isListening ? 'animate-ping' : 'hidden'}`} />
                            <Mic className={`w-8 h-8 text-white relative z-10 ${isListening ? 'animate-bounce' : ''}`} />
                        </button>
                    </div>
                )}

                {/* Transcript */}
                <div className="h-12 text-center text-foreground font-medium opacity-80">
                    {transcript}
                </div>
            </div>
        </div>
    );
}
