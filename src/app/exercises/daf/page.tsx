"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mic, StopCircle, Sliders, Volume2, Info, Ear } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useExerciseCompletion } from '@/hooks/useExerciseCompletion';
import { useConfetti } from '@/hooks/useConfetti';

export default function DAFExercisePage() {
    const router = useRouter();
    const { t } = useLanguage();

    // Core State
    const [isActive, setIsActive] = useState(false);
    const [delay, setDelay] = useState(100); // ms
    const [volume, setVolume] = useState(1.0); // 0.0 - 1.0 (gain)
    const [pitch, setPitch] = useState(0); // For future, not fully supported in simple WebAudio without libraries, but we can simulate/placeholder

    // Refs for Web Audio API
    const audioContextRef = useRef<AudioContext | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const delayNodeRef = useRef<DelayNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const rafRef = useRef<number | null>(null);

    // Visualizer State
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Settings Panel
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [startTime, setStartTime] = useState<number>(0);

    const { completeExercise } = useExerciseCompletion();
    const { fireConfetti } = useConfetti();

    // Initialize/Cleanup Audio
    useEffect(() => {
        return () => {
            stopAudio();
        };
    }, []);

    // Update nodes when settings change
    useEffect(() => {
        if (delayNodeRef.current) {
            delayNodeRef.current.delayTime.value = delay / 1000;
        }
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = volume;
        }
    }, [delay, volume]);


    const startAudio = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false, // DAF needs clean, raw audio usually
                    autoGainControl: false,

                }
            });

            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            const ctx = audioContextRef.current;

            // Create Nodes
            sourceRef.current = ctx.createMediaStreamSource(stream);
            delayNodeRef.current = ctx.createDelay(1.0); // Max delay 1s
            delayNodeRef.current.delayTime.value = delay / 1000;

            gainNodeRef.current = ctx.createGain();
            gainNodeRef.current.gain.value = volume;

            analyserRef.current = ctx.createAnalyser();
            analyserRef.current.fftSize = 256;

            // Connect: Source -> Delay -> Gain -> Destination (Speakers)
            // Also: Source -> Analyser (Visuals)

            // Note: Connecting Source -> Delay -> Gain -> Destination causes the "delayed" sound
            // We do NOT want to hear the undelayed sound directly if possible, or maybe we do depending on DAF style.
            // Usually DAF is: Talk -> Hear yourself with Delay. 
            // Browser might already play Mic input if not handled carefully, but usually getUserMedia doesn't play back unless connected to destination.

            sourceRef.current.connect(delayNodeRef.current);
            delayNodeRef.current.connect(gainNodeRef.current);
            gainNodeRef.current.connect(ctx.destination);

            // Visualizer connection (from source or output? From source to see input)
            sourceRef.current.connect(analyserRef.current);

            setIsActive(true);
            setStartTime(Date.now());
            drawVisualizer();

        } catch {
            alert(t('common.microphoneAccessDenied'));
        }
    };

    const stopAudio = async () => {
        const durationMinutes = Math.round((Date.now() - startTime) / 60000) || 1;

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
        }
        setIsActive(false);

        // Track completion if used for more than 30 seconds
        if (Date.now() - startTime > 30000) {
            fireConfetti();
            await completeExercise({
                exerciseType: 'daf',
                durationMinutes,
                xpEarned: 30 + (durationMinutes * 5), // Bonus for longer usage
            });
        }
    };

    const toggleDAF = () => {
        if (isActive) {
            stopAudio();
        } else {
            startAudio();
        }
    };

    // Visualization Loop
    const drawVisualizer = () => {
        if (!canvasRef.current || !analyserRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            if (!isActive) return;

            rafRef.current = requestAnimationFrame(draw);
            analyserRef.current!.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Styling
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#06b6d4'); // cyan-500
            gradient.addColorStop(1, '#3b82f6'); // blue-500
            ctx.fillStyle = gradient;

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2;
                // Center visualization or typical bottom-up
                // Let's do a symmetric waveform-like or simple bars
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }
        };

        draw();
    };


    return (
        <div className="min-h-screen bg-slate-950 flex flex-col text-white font-sans overflow-hidden">
            {/* Header */}
            <div className="w-full px-6 py-4 flex justify-between items-center z-10 bg-slate-900/50 backdrop-blur-md border-b border-white/5">
                <button onClick={() => router.back()} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-white rtl-flip" />
                </button>
                <div className="flex items-center gap-2">
                    <Ear className="w-5 h-5 text-cyan-400" />
                    <h1 className="text-lg font-bold tracking-wide">{t('exercises.daf.title')}</h1>
                </div>
                <button
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className={`p-2 rounded-xl transition-colors ${isSettingsOpen ? 'bg-cyan-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                >
                    <Sliders className="w-5 h-5" />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center relative px-6">

                {/* Visualizer Circle */}
                <div className="relative w-80 h-80 flex items-center justify-center mb-12">
                    {/* Outer Activity Ring */}
                    <motion.div
                        animate={{
                            scale: isActive ? [1, 1.05, 1] : 1,
                            opacity: isActive ? 1 : 0.2
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 rounded-full border-2 border-cyan-500/30"
                    />

                    <div className="w-64 h-64 bg-slate-900 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden">
                        {/* Canvas for Visuals */}
                        <canvas
                            ref={canvasRef}
                            width={256}
                            height={128}
                            className="absolute bottom-1/2 translate-y-1/2 opacity-80"
                        />

                        {/* Status Text/Icon */}
                        <div className="z-10 flex flex-col items-center pointer-events-none">
                            {isActive ? (
                                <>
                                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mb-2 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                                    <span className="text-2xl font-bold font-mono text-white">{delay}ms</span>
                                    <span className="text-xs text-slate-400 mt-1">{t('exercises.daf.delay')}</span>
                                </>
                            ) : (
                                <span className="text-slate-500 text-sm">{t('exercises.daf.ready')}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info Text */}
                <div className="text-center max-w-sm mb-12">
                    <h2 className="text-xl font-semibold mb-2 text-white">
                        {isActive ? t('exercises.daf.speakNow') : t('exercises.daf.startSpeaking')}
                    </h2>
                    <p className="text-slate-400 text-sm">
                        {t('exercises.daf.info')}
                    </p>
                </div>

                {/* Primary Button */}
                <button
                    onClick={toggleDAF}
                    className={`
                        w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all
                        ${isActive
                            ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30 animate-pulse-slow'
                            : 'bg-cyan-500 hover:bg-cyan-600 shadow-cyan-500/30 hover:scale-105 active:scale-95'
                        }
                    `}
                >
                    {isActive ? (
                        <StopCircle className="w-10 h-10 text-white fill-current" />
                    ) : (
                        <Mic className="w-10 h-10 text-white fill-current" />
                    )}
                </button>
            </div>

            {/* Settings Sheet (Slide Up) */}
            <AnimatePresence>
                {isSettingsOpen && (
                    <div className="absolute top-[72px] left-0 right-0 bottom-0 z-20 pointer-events-none flex flex-col justify-end">
                        {/* Backdrop mostly transparent/blur for context */}

                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-slate-900 border-t border-white/10 rounded-t-3xl p-8 pointer-events-auto shadow-2xl h-[45%]"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Sliders className="w-5 h-5 text-cyan-400" /> {t('settings.title')}
                                </h3>
                                <button onClick={() => setIsSettingsOpen(false)} className="text-sm text-cyan-400 font-medium">{t('common.ok')}</button>
                            </div>

                            <div className="space-y-8">
                                {/* Delay Slider */}
                                <div>
                                    <div className="flex justify-between mb-4">
                                        <label className="text-sm text-slate-300 font-medium">{t('exercises.daf.delayTime')}</label>
                                        <span className="text-sm font-bold text-cyan-400">{delay} ms</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="500"
                                        step="10"
                                        value={delay}
                                        onChange={(e) => setDelay(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                    />
                                    <div className="flex justify-between mt-2 text-xs text-slate-500">
                                        <span>{t('exercises.daf.instant')}</span>
                                        <span>{t('exercises.daf.halfSec')}</span>
                                    </div>
                                </div>

                                {/* Volume Slider */}
                                <div>
                                    <div className="flex justify-between mb-4">
                                        <label className="text-sm text-slate-300 font-medium flex items-center gap-2">
                                            <Volume2 className="w-4 h-4" /> {t('exercises.daf.volume')}
                                        </label>
                                        <span className="text-sm font-bold text-cyan-400">{Math.round(volume * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="2"
                                        step="0.1"
                                        value={volume}
                                        onChange={(e) => setVolume(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
}
