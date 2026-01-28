"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Mic, Square, Activity } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function PitchAnalysisPage() {
    const router = useRouter();
    const { t } = useLanguage();

    // Audio Context
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const rafRef = useRef<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const startAnalysis = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 2048;

            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            sourceRef.current.connect(analyserRef.current);

            setIsAnalyzing(true);
            drawVisualizer();
        } catch (err) {
            console.error("Mic error:", err);
            alert("Mikrofon izni gerekli.");
        }
    };

    const stopAnalysis = () => {
        if (sourceRef.current) sourceRef.current.disconnect();
        if (analyserRef.current) analyserRef.current.disconnect();
        if (audioContextRef.current) audioContextRef.current.close();
        if (rafRef.current) cancelAnimationFrame(rafRef.current);

        setIsAnalyzing(false);
    };

    const drawVisualizer = () => {
        if (!analyserRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            if (!analyserRef.current) return;

            rafRef.current = requestAnimationFrame(draw);
            analyserRef.current.getByteFrequencyData(dataArray);

            ctx.fillStyle = 'rbg(0, 0, 0)';
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Use transparent or bg color

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i];

                // Dynamic Gradient
                const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
                gradient.addColorStop(0, '#3b82f6'); // Blue-500
                gradient.addColorStop(1, '#a855f7'); // Purple-500

                ctx.fillStyle = gradient;
                ctx.fillRect(x, canvas.height - barHeight / 1.5, barWidth, barHeight / 1.5);

                x += barWidth + 1;
            }
        };

        draw();
    };

    // Cleanup
    useEffect(() => {
        return () => {
            stopAnalysis();
        };
    }, []);

    return (
        <div className="min-h-screen bg-background pb-safe flex flex-col">
            {/* Header */}
            <div className="w-full px-6 py-4 flex justify-between items-center bg-card border-b border-border">
                <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-xl transition-colors">
                    <ArrowLeft className="w-5 h-5 text-foreground rtl-flip" />
                </button>
                <h1 className="font-bold text-foreground">Ses Analizi (Pitch)</h1>
                <div className="w-8" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8">

                {/* Visualizer Area */}
                <div className="relative w-full max-w-lg aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-border/20">
                    <canvas
                        ref={canvasRef}
                        width={600}
                        height={400}
                        className="w-full h-full"
                    />

                    {!isAnalyzing && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50 bg-black/50 backdrop-blur-sm">
                            <Activity className="w-16 h-16 mb-4 opacity-50" />
                            <p>Analiz için başlatın</p>
                        </div>
                    )}
                </div>

                {/* Info Card */}
                <div className="max-w-md text-center space-y-2">
                    <h3 className="font-semibold text-lg text-foreground">Ses Tonu Görselleştirme</h3>
                    <p className="text-muted-foreground text-sm">
                        Konuşurken sesinizin frekans dağılımını izleyin. Monoton konuşmaktan kaçınmak için renklerin ve yüksekliklerin değiştiğini görmelisiniz.
                    </p>
                </div>

                {/* Controls */}
                <button
                    onClick={isAnalyzing ? stopAnalysis : startAnalysis}
                    className={`
                        w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95
                        ${isAnalyzing ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'}
                    `}
                >
                    {isAnalyzing ? (
                        <Square className="w-8 h-8 text-white fill-current" />
                    ) : (
                        <Mic className="w-8 h-8 text-white" />
                    )}
                </button>

            </div>
        </div>
    );
}
