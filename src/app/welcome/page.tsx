"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles, Star, Users, Award, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

const slides = [
    {
        id: 1,
        emoji: '🎙️',
        title: "KonuşKoç'a Hoşgeldin",
        subtitle: "Konuşma terapisi artık cebinde",
        description: "Binlerce kullanıcının güvendiği, bilimsel yöntemlerle konuşma becerilerini geliştir",
        gradient: "from-teal-400 to-cyan-500",
        bgGradient: "from-teal-500/20 via-transparent to-cyan-500/20",
        stats: null,
    },
    {
        id: 2,
        emoji: '🎯',
        title: "Sana Özel Program",
        subtitle: "Hedefine göre tasarlandı",
        description: "Kekemelik, sunum korkusu, okuma güçlüğü... Senin için özelleştirilmiş egzersizler",
        gradient: "from-violet-400 to-purple-500",
        bgGradient: "from-violet-500/20 via-transparent to-purple-500/20",
        features: ['Kekemelik Terapisi', 'Sunum Becerileri', 'Okuma Pratiği', 'Çocuk Gelişimi'],
    },
    {
        id: 3,
        emoji: '🧠',
        title: "Bilimsel Teknikler",
        subtitle: "Uzmanlar tarafından onaylandı",
        description: "DAF, Metronom, Nefes egzersizleri ve kanıtlanmış terapi yöntemleri",
        gradient: "from-amber-400 to-orange-500",
        bgGradient: "from-amber-500/20 via-transparent to-orange-500/20",
        techniques: [
            { icon: '🎧', name: 'DAF Modu' },
            { icon: '🎵', name: 'Metronom' },
            { icon: '💨', name: 'Nefes Egzersizleri' },
            { icon: '📊', name: 'İlerleme Takibi' },
        ],
    },
    {
        id: 4,
        emoji: '🚀',
        title: "Hemen Başla!",
        subtitle: "İlk adımı bugün at",
        description: "Ücretsiz hesap oluştur ve hemen ilk egzersizini tamamla",
        gradient: "from-emerald-400 to-teal-500",
        bgGradient: "from-emerald-500/20 via-transparent to-teal-500/20",
        isLast: true,
        stats: [
            { icon: Users, value: '50K+', label: 'Kullanıcı' },
            { icon: Star, value: '4.8', label: 'Puan' },
            { icon: Award, value: '17+', label: 'Egzersiz' },
        ],
    },
];

// Floating particles
const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                    width: Math.random() * 4 + 2,
                    height: Math.random() * 4 + 2,
                    background: `rgba(255,255,255,${Math.random() * 0.3 + 0.1})`,
                }}
                initial={{
                    x: Math.random() * 400,
                    y: Math.random() * 800,
                }}
                animate={{
                    y: [null, -100],
                    x: [null, Math.random() * 50 - 25],
                    opacity: [0, 1, 0],
                }}
                transition={{
                    duration: Math.random() * 4 + 4,
                    repeat: Infinity,
                    delay: Math.random() * 3,
                    ease: "easeOut",
                }}
            />
        ))}
    </div>
);

// Animated icon component
const AnimatedIcon = ({ emoji, gradient }: { emoji: string; gradient: string }) => (
    <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="relative"
    >
        {/* Glow effect */}
        <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-[2rem] blur-2xl opacity-50`}
            animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity }}
        />

        {/* Icon container */}
        <motion.div
            className={`relative w-28 h-28 rounded-[2rem] bg-gradient-to-br ${gradient} flex items-center justify-center shadow-2xl`}
            animate={{
                y: [0, -8, 0],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
            <motion.span
                className="text-5xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                {emoji}
            </motion.span>
        </motion.div>

        {/* Orbiting particles */}
        <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
            {[0, 90, 180, 270].map((deg, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full shadow-lg"
                    style={{
                        top: '50%',
                        left: '50%',
                        transform: `rotate(${deg}deg) translateY(-55px)`,
                    }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                />
            ))}
        </motion.div>
    </motion.div>
);

export default function WelcomePage() {
    const router = useRouter();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [hasSeenWelcome, setHasSeenWelcome] = useState<boolean | null>(null);

    useEffect(() => {
        const seen = localStorage.getItem('hasSeenWelcome');
        if (seen === 'true') {
            router.replace('/auth');
            return;
        }
        setHasSeenWelcome(false);
    }, [router]);

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        }
    };

    const handleSkip = () => {
        localStorage.setItem('hasSeenWelcome', 'true');
        router.push('/auth');
    };

    const handleGetStarted = () => {
        // Confetti effect
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#14b8a6', '#06b6d4', '#8b5cf6', '#f59e0b'],
        });

        setTimeout(() => {
            localStorage.setItem('hasSeenWelcome', 'true');
            router.push('/auth');
        }, 800);
    };

    if (hasSeenWelcome === null) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full"
                />
            </div>
        );
    }

    const slide = slides[currentSlide];

    return (
        <div className="min-h-screen bg-slate-900 relative overflow-hidden">
            {/* Animated gradient background */}
            <motion.div
                key={slide.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={`absolute inset-0 bg-gradient-to-br ${slide.bgGradient}`}
            />

            {/* Mesh gradient overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent" />

            <FloatingParticles />

            {/* Skip button */}
            {!slide.isLast && (
                <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={handleSkip}
                    className="absolute top-12 right-6 text-white/50 hover:text-white text-sm font-medium z-10 flex items-center gap-1 transition-colors"
                >
                    Atla <ChevronRight className="w-4 h-4" />
                </motion.button>
            )}

            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col justify-center px-6 py-16">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={slide.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col items-center text-center"
                    >
                        {/* Animated Icon */}
                        <AnimatedIcon emoji={slide.emoji} gradient={slide.gradient} />

                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-3xl font-bold text-white mt-8 mb-2"
                        >
                            {slide.title}
                        </motion.h1>

                        {/* Subtitle with gradient */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className={`text-lg font-semibold bg-gradient-to-r ${slide.gradient} bg-clip-text text-transparent mb-4`}
                        >
                            {slide.subtitle}
                        </motion.p>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-white/60 text-base max-w-sm leading-relaxed"
                        >
                            {slide.description}
                        </motion.p>

                        {/* Features (Slide 2) */}
                        {slide.features && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="flex flex-wrap justify-center gap-2 mt-6"
                            >
                                {slide.features.map((feature, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                        className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm border border-white/10"
                                    >
                                        {feature}
                                    </motion.span>
                                ))}
                            </motion.div>
                        )}

                        {/* Techniques (Slide 3) */}
                        {slide.techniques && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="grid grid-cols-2 gap-3 mt-6 w-full max-w-xs"
                            >
                                {slide.techniques.map((tech, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + i * 0.1 }}
                                        className="flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10"
                                    >
                                        <span className="text-xl">{tech.icon}</span>
                                        <span className="text-white/80 text-sm font-medium">{tech.name}</span>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {/* Stats (Last slide) */}
                        {slide.stats && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="flex gap-6 mt-8"
                            >
                                {slide.stats.map((stat, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 + i * 0.1 }}
                                        className="text-center"
                                    >
                                        <stat.icon className={`w-5 h-5 mx-auto mb-1 bg-gradient-to-r ${slide.gradient} text-white rounded-lg p-1 box-content`} />
                                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                                        <p className="text-xs text-white/50">{stat.label}</p>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Bottom section */}
                <div className="mt-auto pt-12">
                    {/* Progress dots */}
                    <div className="flex justify-center gap-2 mb-8">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className="relative h-2 rounded-full overflow-hidden transition-all duration-300"
                                style={{ width: index === currentSlide ? 32 : 8 }}
                            >
                                <div className="absolute inset-0 bg-white/20" />
                                {index === currentSlide && (
                                    <motion.div
                                        layoutId="activeSlide"
                                        className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`}
                                    />
                                )}
                                {index < currentSlide && (
                                    <div className={`absolute inset-0 bg-gradient-to-r ${slides[index].gradient}`} />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Buttons */}
                    {slide.isLast ? (
                        <div className="space-y-3">
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleGetStarted}
                                className={`w-full py-4 rounded-2xl font-semibold text-white bg-gradient-to-r ${slide.gradient} shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2`}
                            >
                                <Sparkles className="w-5 h-5" />
                                Ücretsiz Başla
                            </motion.button>
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    localStorage.setItem('hasSeenWelcome', 'true');
                                    router.push('/auth');
                                }}
                                className="w-full py-4 rounded-2xl font-medium text-white/60 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
                            >
                                Zaten hesabım var
                            </motion.button>
                        </div>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleNext}
                            className={`w-full py-4 rounded-2xl font-semibold text-white bg-gradient-to-r ${slide.gradient} shadow-lg flex items-center justify-center gap-2`}
                        >
                            Devam
                            <ChevronRight className="w-5 h-5" />
                        </motion.button>
                    )}
                </div>
            </div>
        </div>
    );
}
