"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, RotateCcw, Settings2, FastForward, Gauge, Type } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function RSVPExercisePage() {
    const router = useRouter();
    const { t } = useLanguage();

    // State
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [wpm, setWpm] = useState(300); // Words per minute
    const [text, setText] = useState("Hızlı okuma, metinleri daha kısa sürede anlamanızı sağlayan bir tekniktir. Göz kaslarınızı geliştirerek ve iç seslendirmeyi azaltarak okuma hızınızı artırabilirsiniz. Bu egzersiz, kelimeleri tek tek göstererek görsel algınızı hızlandırmayı amaçlar.");
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Derived state
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const intervalMs = 60000 / wpm;

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isPlaying && currentWordIndex < words.length) {
            interval = setInterval(() => {
                setCurrentWordIndex(prev => {
                    if (prev >= words.length - 1) {
                        setIsPlaying(false);
                        setShowResults(true);
                        return prev;
                    }
                    return prev + 1;
                });
            }, intervalMs);
        }

        return () => clearInterval(interval);
    }, [isPlaying, currentWordIndex, words.length, intervalMs]);

    const handleRestart = () => {
        setIsPlaying(false);
        setCurrentWordIndex(0);
        setShowResults(false);
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        setCurrentWordIndex(0);
        setIsPlaying(false);
    };

    // Find the "center" of the word for optimal RSVP alignment
    const currentWord = words[currentWordIndex] || "";
    const pivotIndex = Math.floor((currentWord.length - 1) / 2);
    const leftPart = currentWord.slice(0, pivotIndex);
    const pivotChar = currentWord[pivotIndex];
    const rightPart = currentWord.slice(pivotIndex + 1);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden text-slate-100 font-sans">
            {/* Header */}
            <div className="w-full px-6 py-4 flex justify-between items-center z-10 bg-slate-900/50 backdrop-blur-md border-b border-white/5">
                <button onClick={() => router.back()} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-white rtl-flip" />
                </button>
                <h1 className="text-lg font-bold text-white tracking-wide">RSVP Okuma</h1>
                <button
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className={`p-2 rounded-xl transition-colors ${isSettingsOpen ? 'bg-cyan-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                >
                    <Settings2 className="w-5 h-5" />
                </button>
            </div>

            {/* RSVP Display Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative">
                {/* Focus Guides */}
                <div className="absolute top-1/2 left-0 right-0 h-[2px] -mt-8 mx-auto w-64 flex justify-between pointer-events-none">
                    <div className="w-[2px] h-4 bg-slate-700/50"></div>
                    <div className="w-[2px] h-4 bg-slate-700/50"></div>
                </div>
                <div className="absolute top-1/2 left-0 right-0 h-[2px] mt-8 mx-auto w-64 flex justify-between pointer-events-none">
                    <div className="w-[2px] h-4 bg-slate-700/50"></div>
                    <div className="w-[2px] h-4 bg-slate-700/50"></div>
                </div>

                {/* The Word */}
                <div className="text-6xl md:text-8xl font-mono mb-8 flex items-baseline justify-center relative w-full px-4 h-32">
                    <div className="flex items-center">
                        <span className="text-slate-400 text-right w-1/2">{leftPart}</span>
                        <span className="text-cyan-400 font-bold mx-[1px] transform scale-110">{pivotChar}</span>
                        <span className="text-slate-400 text-left w-1/2">{rightPart}</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden mb-8">
                    <motion.div
                        className="h-full bg-cyan-500"
                        animate={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }}
                        transition={{ ease: "linear", duration: intervalMs / 1000 }}
                    />
                </div>

                {/* Info Stats */}
                <div className="flex gap-8 text-sm text-slate-400 font-mono">
                    <div className="flex items-center gap-2">
                        <Gauge className="w-4 h-4" />
                        <span>{wpm} WPM</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        <span>{currentWordIndex + 1} / {words.length}</span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="p-8 flex justify-center gap-6 pb-safe">
                <button
                    onClick={handleRestart}
                    className="p-4 bg-slate-800/50 rounded-full hover:bg-slate-700 transition-colors"
                >
                    <RotateCcw className="w-6 h-6 text-white" />
                </button>

                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-6 bg-cyan-500 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 transition-all"
                >
                    {isPlaying ? (
                        <Pause className="w-8 h-8 text-white fill-current" />
                    ) : (
                        <Play className="w-8 h-8 text-white fill-current translate-x-1" />
                    )}
                </button>
            </div>

            {/* Settings Overlay */}
            <AnimatePresence>
                {isSettingsOpen && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 p-6 rounded-t-3xl z-20 shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white">Ayarlar</h3>
                            <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-white">Kapat</button>
                        </div>

                        <div className="space-y-6">
                            {/* Speed Control */}
                            <div>
                                <label className="flex justify-between text-sm text-slate-400 mb-2">
                                    <span>Hız (Kelime/Dakika)</span>
                                    <span className="text-cyan-400 font-bold">{wpm}</span>
                                </label>
                                <input
                                    type="range"
                                    min="100"
                                    max="1000"
                                    step="50"
                                    value={wpm}
                                    onChange={(e) => setWpm(parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                                <div className="flex justify-between text-xs text-slate-500 mt-1">
                                    <span>Yavaş</span>
                                    <span>Çok Hızlı</span>
                                </div>
                            </div>

                            {/* Text Input */}
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Metin</label>
                                <textarea
                                    value={text}
                                    onChange={handleTextChange}
                                    rows={4}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Completion Overlay */}
            <AnimatePresence>
                {showResults && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-30 flex items-center justify-center p-6"
                    >
                        <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
                            <div className="w-16 h-16 bg-cyan-500/20 text-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FastForward className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Tamamlandı! 🎉</h2>
                            <p className="text-slate-400 mb-6">
                                {words.length} kelimeyi ortalama {wpm} WPM hızında okudunuz.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => router.push('/exercises')}
                                    className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700"
                                >
                                    Çıkış
                                </button>
                                <button
                                    onClick={handleRestart}
                                    className="flex-1 py-3 bg-cyan-500 text-white rounded-xl font-medium hover:bg-cyan-600"
                                >
                                    Tekrar
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
