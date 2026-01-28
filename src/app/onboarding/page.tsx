"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, Wind, BookOpen, Mic, MessageSquare, Baby, Brain, Trophy, Coffee, Zap, Flame, Rocket, ArrowLeft, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Onboarding() {
    const router = useRouter();
    const { t } = useLanguage();
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(0);
    const [selection, setSelection] = useState<any>({});

    // State definitions aligned with translations
    const [steps, setSteps] = useState<any[]>([
        {}, // Welcome placeholder
        {}, // Goals placeholder
        {}, // Level placeholder
        {}  // Time placeholder
    ]);

    // Update steps when language changes
    useEffect(() => {
        setSteps([
            {}, // Welcome step handled in render
            {
                title: t('onboarding.goalsTitle'),
                desc: t('onboarding.goalsDesc'),
                options: [
                    { id: 'fluency', label: t('onboarding.goals.fluency'), icon: Wind },
                    { id: 'reading', label: t('onboarding.goals.reading'), icon: BookOpen },
                    { id: 'diction', label: t('onboarding.goals.diction'), icon: Mic },
                    { id: 'learning', label: t('onboarding.goals.learning'), icon: MessageSquare },
                ]
            },
            {
                title: t('onboarding.levelTitle'),
                desc: t('onboarding.levelDesc'),
                options: [
                    { id: 'beginner', label: t('onboarding.levels.beginner'), desc: t('onboarding.levels.beginnerDesc'), icon: Baby },
                    { id: 'intermediate', label: t('onboarding.levels.intermediate'), desc: t('onboarding.levels.intermediateDesc'), icon: Brain },
                    { id: 'advanced', label: t('onboarding.levels.advanced'), desc: t('onboarding.levels.advancedDesc'), icon: Trophy },
                ]
            },
            {
                title: t('onboarding.timeTitle'),
                desc: t('onboarding.timeDesc'),
                options: [
                    { id: '5', label: '5 dk', desc: t('onboarding.types.relaxed'), icon: Coffee },
                    { id: '10', label: '10 dk', desc: t('onboarding.types.normal'), icon: Zap },
                    { id: '20', label: '20 dk', desc: t('onboarding.types.serious'), icon: Flame },
                    { id: '30', label: '30+ dk', desc: t('onboarding.types.intense'), icon: Rocket },
                ]
            }
        ]);
    }, [t]);

    const handleNext = () => {
        setDirection(1);
        setStep(s => s + 1);
    };

    const handleBack = () => {
        setDirection(-1);
        setStep(s => s - 1);
    };

    const finishOnboarding = async () => {
        setDirection(1);
        setStep(4); // Processing step

        // Simulate API call
        setTimeout(async () => {
            try {
                // Save preferences
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await supabase.from('user_preferences').upsert({
                        user_id: user.id,
                        goals: [selection[1]], // Simplification
                        level: selection[2],
                        daily_goal_minutes: parseInt(selection[3])
                    });
                }
            } catch (e) {
                console.error(e);
            }
            router.push('/');
        }, 3000);
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0
        })
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return (
                    <div className="flex flex-col items-center text-center space-y-8 pt-12">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-teal-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/30"
                        >
                            <Zap className="w-12 h-12 text-white" />
                        </motion.div>
                        <div className="space-y-4">
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400 whitespace-pre-line">
                                {t('onboarding.welcomeTitle')}
                            </h1>
                            <p className="text-muted-foreground text-lg px-6 leading-relaxed">
                                {t('onboarding.welcomeDesc')}
                            </p>
                        </div>
                        <div className="absolute bottom-8 w-full px-6">
                            <button onClick={handleNext} className="btn-primary w-full py-4 text-lg rounded-2xl shadow-xl shadow-teal-500/20">
                                {t('common.start')} <ChevronRight className="w-5 h-5 ml-1 inline rtl-flip" />
                            </button>
                        </div>
                    </div>
                );

            case 4: // Processing
                return (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
                        <div className="relative w-32 h-32">
                            <div className="absolute inset-0 rounded-full border-4 border-teal-500/20 animate-ping" />
                            <div className="absolute inset-0 rounded-full border-4 border-t-teal-500 animate-spin" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles className="w-12 h-12 text-teal-500 animate-pulse" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground mb-2">{t('onboarding.processingTitle')}</h2>
                            <p className="text-muted-foreground">{t('onboarding.processingDesc')}</p>
                        </div>
                    </div>
                );

            default:
                const currentData = steps[step];
                if (!currentData || !currentData.options) return null; // Guard

                return (
                    <div className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-foreground">{currentData.title}</h2>
                            <p className="text-muted-foreground">{currentData.desc}</p>
                        </div>

                        <div className="grid gap-3">
                            {currentData.options.map((option: any, index: number) => (
                                <motion.button
                                    key={option.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => setSelection({ ...selection, [step]: option.id })}
                                    className={`
                    flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all
                    ${selection[step] === option.id
                                            ? 'border-teal-500 bg-teal-500/10'
                                            : 'border-white/10 bg-white/5 hover:bg-white/10'}
                  `}
                                >
                                    <div className={`p-3 rounded-xl ${selection[step] === option.id ? 'bg-teal-500 text-white' : 'bg-white/10 text-muted-foreground'}`}>
                                        <option.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-semibold ${selection[step] === option.id ? 'text-teal-500' : 'text-foreground'}`}>
                                            {option.label}
                                        </p>
                                        {option.desc && (
                                            <p className="text-sm text-muted-foreground">{option.desc}</p>
                                        )}
                                    </div>
                                    {selection[step] === option.id && (
                                        <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center">
                                            <Check className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </motion.button>
                            ))}
                        </div>

                        <div className="absolute bottom-8 w-full left-0 px-6 flex gap-4">
                            <button
                                onClick={handleBack}
                                className="px-6 py-4 rounded-2xl bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                            >
                                <ArrowLeft className="w-6 h-6 rtl-flip" />
                            </button>
                            <button
                                onClick={step === steps.length - 1 ? finishOnboarding : handleNext}
                                disabled={!selection[step]}
                                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-400 text-white font-bold shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {step === steps.length - 1 ? t('common.finish') : t('common.continue')}
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-background pb-safe px-6 overflow-hidden">
            {/* Progress Bar */}
            <div className="fixed top-0 left-0 w-full h-1 bg-secondary pointer-events-none z-50">
                <motion.div
                    className="h-full bg-teal-500"
                    animate={{ width: `${((step + 1) / 5) * 100}%` }}
                />
            </div>

            <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={step}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="h-full"
                >
                    {renderStep()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
