"use client";

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AudioWaveformProps {
    isRecording: boolean;
    audioURL?: string | null;
    className?: string;
}

export default function AudioWaveform({ isRecording, audioURL, className = '' }: AudioWaveformProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);

    useEffect(() => {
        if (!isRecording) {
            // Show static waveform when not recording
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const draw = () => {
                const width = canvas.width;
                const height = canvas.height;

                ctx.clearRect(0, 0, width, height);

                // Draw placeholder bars
                const barCount = 50;
                const barWidth = width / barCount - 2;

                for (let i = 0; i < barCount; i++) {
                    const barHeight = Math.random() * 10 + 5;
                    const x = i * (barWidth + 2);
                    const y = (height - barHeight) / 2;

                    const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
                    gradient.addColorStop(0, '#14b8a6');
                    gradient.addColorStop(1, '#06b6d4');

                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.roundRect(x, y, barWidth, barHeight, 2);
                    ctx.fill();
                }
            };

            draw();
            return;
        }

        // Live waveform when recording
        const setupAnalyser = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const audioContext = new AudioContext();
                const source = audioContext.createMediaStreamSource(stream);
                const analyser = audioContext.createAnalyser();

                analyser.fftSize = 256;
                source.connect(analyser);

                analyserRef.current = analyser;
                dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

                const canvas = canvasRef.current;
                if (!canvas) return;

                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                const draw = () => {
                    if (!isRecording) return;

                    animationRef.current = requestAnimationFrame(draw);

                    const analyser = analyserRef.current;
                    const dataArray = dataArrayRef.current;
                    if (!analyser || !dataArray) return;

                    analyser.getByteFrequencyData(dataArray as Uint8Array<ArrayBuffer>);

                    const width = canvas.width;
                    const height = canvas.height;

                    ctx.clearRect(0, 0, width, height);

                    const barWidth = (width / dataArray.length) * 2;
                    let x = 0;

                    for (let i = 0; i < dataArray.length; i++) {
                        const barHeight = (dataArray[i] / 255) * height * 0.8;
                        const y = (height - barHeight) / 2;

                        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
                        gradient.addColorStop(0, '#14b8a6');
                        gradient.addColorStop(1, '#06b6d4');

                        ctx.fillStyle = gradient;
                        ctx.beginPath();
                        ctx.roundRect(x, y, barWidth - 2, barHeight, 2);
                        ctx.fill();

                        x += barWidth;
                    }
                };

                draw();

                return () => {
                    stream.getTracks().forEach(track => track.stop());
                    audioContext.close();
                };
            } catch (err) {
                console.error('Waveform error:', err);
            }
        };

        setupAnalyser();

        return () => {
            cancelAnimationFrame(animationRef.current);
        };
    }, [isRecording]);

    return (
        <motion.div
            className={`relative ${className}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <canvas
                ref={canvasRef}
                width={300}
                height={80}
                className="w-full h-20 rounded-xl"
            />
            {isRecording && (
                <motion.div
                    className="absolute top-2 right-2 flex items-center gap-1.5"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                >
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-xs text-red-500 font-medium">REC</span>
                </motion.div>
            )}
        </motion.div>
    );
}
