"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Mic, Square, Play, Pause, RotateCcw,
    Volume2, Clock, Sliders, Check, ChevronDown, ChevronUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useDAF } from '@/hooks/useDAF';
import { useMetronome } from '@/hooks/useMetronome';
import AudioWaveform from '@/components/AudioWaveform';
import BottomNav from '@/components/BottomNav';

// Sample texts for practice
const practiceTexts = [
    "Bugün hava çok güzel. Parkta yürüyüş yapmak istiyorum.",
    "Merhaba, benim adım Ahmet. Sizinle tanıştığıma memnun oldum.",
    "Bu sabah erkenden kalktım ve kahvaltı hazırladım.",
    "Yarın arkadaşlarımla buluşacağım. Çok heyecanlıyım.",
    "Türkçe öğrenmek çok keyifli. Her gün yeni kelimeler öğreniyorum.",
];

export default function RecordPage() {
    const router = useRouter();
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [showTools, setShowTools] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const {
        isRecording,
        isPaused,
        recordingTime,
        audioURL,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        resetRecording,
        error: recordError,
    } = useAudioRecorder();

    const {
        isActive: isDAFActive,
        delayMs,
        setDelayMs,
        startDAF,
        stopDAF,
        error: dafError,
    } = useDAF();

    const {
        isPlaying: isMetronomePlaying,
        bpm,
        setBpm,
        start: startMetronome,
        stop: stopMetronome,
        currentBeat,
    } = useMetronome();

    // Format time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Toggle recording
    const handleRecordToggle = async () => {
        if (isRecording) {
            stopRecording();
        } else {
            await startRecording();
        }
    };

    // Toggle DAF
    const handleDAFToggle = async () => {
        if (isDAFActive) {
            stopDAF();
        } else {
            await startDAF();
        }
    };

    // Toggle Metronome
    const handleMetronomeToggle = () => {
        if (isMetronomePlaying) {
            stopMetronome();
        } else {
            startMetronome();
        }
    };

    // Play recorded audio
    const handlePlayToggle = () => {
        if (!audioRef.current || !audioURL) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    // Next text
    const nextText = () => {
        setCurrentTextIndex((prev) => (prev + 1) % practiceTexts.length);
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="flex items-center justify-between p-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-xl">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="font-semibold text-foreground">Ses Kaydı</h1>
                    <div className="w-9" />
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Practice Text Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl p-5 shadow-lg"
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-white/80 text-sm font-medium">Okuma Metni</span>
                        <button
                            onClick={nextText}
                            className="text-white/80 text-sm hover:text-white flex items-center gap-1"
                        >
                            Değiştir <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-white text-lg leading-relaxed">
                        "{practiceTexts[currentTextIndex]}"
                    </p>
                </motion.div>

                {/* Waveform */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card rounded-2xl p-5 border border-border"
                >
                    <AudioWaveform isRecording={isRecording} audioURL={audioURL} />

                    {/* Timer */}
                    <div className="flex items-center justify-center mt-4">
                        <div className="flex items-center gap-2 text-2xl font-mono text-foreground">
                            <Clock className="w-5 h-5 text-muted-foreground" />
                            {formatTime(recordingTime)}
                        </div>
                    </div>
                </motion.div>

                {/* Error Messages */}
                <AnimatePresence>
                    {(recordError || dafError) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-destructive text-sm"
                        >
                            {recordError || dafError}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Recording Controls */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-center gap-6"
                >
                    {/* Reset Button */}
                    {audioURL && !isRecording && (
                        <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            onClick={resetRecording}
                            className="p-4 bg-secondary rounded-full hover:bg-secondary/80 transition-colors"
                        >
                            <RotateCcw className="w-6 h-6 text-foreground" />
                        </motion.button>
                    )}

                    {/* Main Record Button */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRecordToggle}
                        className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all ${isRecording
                                ? 'bg-red-500 shadow-red-500/30'
                                : 'bg-gradient-to-br from-teal-500 to-cyan-500 shadow-teal-500/30'
                            }`}
                    >
                        {isRecording ? (
                            <Square className="w-8 h-8 text-white" fill="white" />
                        ) : (
                            <Mic className="w-8 h-8 text-white" />
                        )}
                    </motion.button>

                    {/* Play Button */}
                    {audioURL && !isRecording && (
                        <motion.button
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            onClick={handlePlayToggle}
                            className="p-4 bg-secondary rounded-full hover:bg-secondary/80 transition-colors"
                        >
                            {isPlaying ? (
                                <Pause className="w-6 h-6 text-foreground" />
                            ) : (
                                <Play className="w-6 h-6 text-foreground" />
                            )}
                        </motion.button>
                    )}
                </motion.div>

                {/* Hidden Audio Element */}
                {audioURL && (
                    <audio
                        ref={audioRef}
                        src={audioURL}
                        onEnded={() => setIsPlaying(false)}
                    />
                )}

                {/* Tools Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-card rounded-2xl border border-border overflow-hidden"
                >
                    {/* Tools Header */}
                    <button
                        onClick={() => setShowTools(!showTools)}
                        className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <Sliders className="w-5 h-5 text-primary" />
                            <span className="font-medium text-foreground">Araçlar</span>
                        </div>
                        {showTools ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                    </button>

                    {/* Tools Content */}
                    <AnimatePresence>
                        {showTools && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-border"
                            >
                                {/* DAF Control */}
                                <div className="p-4 border-b border-border">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="font-medium text-foreground">DAF Modu</h3>
                                            <p className="text-sm text-muted-foreground">Gecikmeli ses geri bildirimi</p>
                                        </div>
                                        <button
                                            onClick={handleDAFToggle}
                                            className={`w-12 h-7 rounded-full p-1 transition-colors ${isDAFActive ? 'bg-primary' : 'bg-secondary'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${isDAFActive ? 'translate-x-5' : 'translate-x-0'
                                                }`} />
                                        </button>
                                    </div>

                                    {isDAFActive && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="space-y-2"
                                        >
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Gecikme: {delayMs}ms</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="50"
                                                max="300"
                                                step="10"
                                                value={delayMs}
                                                onChange={(e) => setDelayMs(parseInt(e.target.value))}
                                                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                            />
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>50ms</span>
                                                <span>300ms</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Metronome Control */}
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="font-medium text-foreground">Metronom</h3>
                                            <p className="text-sm text-muted-foreground">Ritmik konuşma pratiği</p>
                                        </div>
                                        <button
                                            onClick={handleMetronomeToggle}
                                            className={`w-12 h-7 rounded-full p-1 transition-colors ${isMetronomePlaying ? 'bg-primary' : 'bg-secondary'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${isMetronomePlaying ? 'translate-x-5' : 'translate-x-0'
                                                }`} />
                                        </button>
                                    </div>

                                    {isMetronomePlaying && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="space-y-3"
                                        >
                                            {/* Beat Indicator */}
                                            <div className="flex items-center justify-center gap-2">
                                                {[0, 1, 2, 3].map((beat) => (
                                                    <motion.div
                                                        key={beat}
                                                        animate={{
                                                            scale: currentBeat === beat ? 1.3 : 1,
                                                            backgroundColor: currentBeat === beat ? '#14b8a6' : '#e2e8f0',
                                                        }}
                                                        className="w-4 h-4 rounded-full"
                                                    />
                                                ))}
                                            </div>

                                            {/* BPM Slider */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Hız: {bpm} BPM</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="40"
                                                    max="120"
                                                    step="5"
                                                    value={bpm}
                                                    onChange={(e) => setBpm(parseInt(e.target.value))}
                                                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                                />
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>Yavaş</span>
                                                    <span>Hızlı</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Save Button */}
                {audioURL && !isRecording && (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full py-4 bg-gradient-primary text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
                    >
                        <Check className="w-5 h-5" />
                        Kaydı Kaydet
                    </motion.button>
                )}
            </div>

            <BottomNav />
        </div>
    );
}
