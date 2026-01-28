"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, Settings2, RotateCcw, Type, Monitor } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function TeleprompterPage() {
    const router = useRouter();
    const { t } = useLanguage();

    // State
    const [text, setText] = useState("Sayın misafirler, değerli katılımcılar. Bugün burada toplanmamızın amacı, geleceğin teknolojilerini tartışmak ve sürdürülebilir bir dünya için atabileceğimiz adımları belirlemektir. Teknoloji sadece bir araç değil, aynı zamanda toplumları dönüştüren bir güçtür. Bizler, bu gücü iyilik için kullanmakla yükümlüyüz. Hepinize katılımınız için teşekkür ederim.");
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(30); // pixels/sec roughly
    const [fontSize, setFontSize] = useState(48);
    const [isMirrored, setIsMirrored] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const scrollerRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);

    // Scroll Logic
    useEffect(() => {
        const scroll = () => {
            if (!isPlaying || !scrollerRef.current) return;

            scrollerRef.current.scrollTop += speed / 60; // 60fps approx

            // Check if reached end
            if (scrollerRef.current.scrollTop + scrollerRef.current.clientHeight >= scrollerRef.current.scrollHeight - 10) {
                setIsPlaying(false);
            } else {
                rafRef.current = requestAnimationFrame(scroll);
            }
        };

        if (isPlaying) {
            rafRef.current = requestAnimationFrame(scroll);
        } else {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        }

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [isPlaying, speed]);

    const handleRestart = () => {
        setIsPlaying(false);
        if (scrollerRef.current) {
            scrollerRef.current.scrollTop = 0;
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="w-full px-6 py-4 flex justify-between items-center z-20 bg-black/50 backdrop-blur-md border-b border-white/10 absolute top-0">
                <button onClick={() => router.back()} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-white rtl-flip" />
                </button>
                <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-cyan-400" />
                    <h1 className="text-sm font-bold tracking-wide uppercase">Teleprompter</h1>
                </div>
                <button
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className={`p-2 rounded-xl transition-colors ${isSettingsOpen ? 'bg-cyan-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                >
                    <Settings2 className="w-5 h-5" />
                </button>
            </div>

            {/* Prompter Area */}
            <div className="flex-1 relative overflow-hidden flex justify-center">
                {/* Guide Lines */}
                <div className="absolute top-1/2 left-0 right-0 h-24 -mt-12 border-y-2 border-cyan-500/30 bg-cyan-500/5 pointer-events-none z-10 flex items-center justify-between px-4">
                    <div className="w-4 h-4 border-l-2 border-t-2 border-cyan-500/50" />
                    <div className="w-4 h-4 border-r-2 border-t-2 border-cyan-500/50" />
                </div>

                {/* Text Scroller */}
                <div
                    ref={scrollerRef}
                    className={`
                        w-full max-w-4xl h-full overflow-y-auto no-scrollbar px-8 py-[50vh] text-center font-bold leading-normal outline-none
                        ${isMirrored ? 'scale-x-[-1] scale-y-[-1]' : ''}
                    `}
                    style={{ fontSize: `${fontSize}px` }}
                    contentEditable={!isPlaying}
                    onInput={(e) => setText(e.currentTarget.textContent || "")}
                    suppressContentEditableWarning={true}
                >
                    {text}
                </div>
            </div>

            {/* Controls */}
            <div className="p-8 pb-safe flex justify-center gap-6 z-20 bg-gradient-to-t from-black via-black/80 to-transparent">
                <button
                    onClick={handleRestart}
                    className="p-4 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
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
                        className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 p-6 rounded-t-3xl z-30 shadow-2xl pb-safe"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white">Ayarlar</h3>
                            <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-white">Kapat</button>
                        </div>

                        <div className="space-y-6">
                            {/* Speed */}
                            <div>
                                <label className="flex justify-between text-sm text-slate-400 mb-2">
                                    <span>Akış Hızı</span>
                                    <span className="text-cyan-400 font-bold">{Math.round(speed / 10)}x</span>
                                </label>
                                <input
                                    type="range"
                                    min="10"
                                    max="200"
                                    step="5"
                                    value={speed}
                                    onChange={(e) => setSpeed(parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                            </div>

                            {/* Font Size */}
                            <div>
                                <label className="flex justify-between text-sm text-slate-400 mb-2">
                                    <span>Yazı Boyutu</span>
                                    <span className="text-cyan-400 font-bold">{fontSize}px</span>
                                </label>
                                <input
                                    type="range"
                                    min="24"
                                    max="120"
                                    step="4"
                                    value={fontSize}
                                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                            </div>

                            {/* Options */}
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Type className="w-5 h-5 text-slate-400" />
                                    <span className="text-white">Ayna Modu</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={isMirrored} onChange={(e) => setIsMirrored(e.target.checked)} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                                </label>
                            </div>

                            {/* Text Input Toggle */}
                            <div className="text-xs text-slate-500 text-center mt-4">
                                * Metni değiştirmek için ekrana dokunun ve yazın (oynatma durdurulduğunda).
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
