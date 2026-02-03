"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Crown, Check, Zap, Sparkles, Shield, Star,
    Mic, BookOpen, Clock, Flame
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useSubscription, FREE_LIMITS } from '@/hooks/useSubscription';

interface PaywallModalProps {
    isOpen: boolean;
    onClose: () => void;
    trigger?: 'exercise' | 'daf' | 'recording' | 'general';
}

/**
 * Paywall modal shown when user hits free tier limits.
 * Shows premium benefits and trial/upgrade options.
 */
export function PaywallModal({ isOpen, onClose, trigger = 'general' }: PaywallModalProps) {
    const router = useRouter();
    const { t } = useLanguage();
    const { startTrial, isTrialing, trialDaysLeft } = useSubscription();
    const [isStartingTrial, setIsStartingTrial] = useState(false);

    const triggerMessages: Record<string, string> = {
        exercise: t('paywall.limitExercise') || 'Günlük egzersiz limitine ulaştın',
        daf: t('paywall.limitDAF') || 'Günlük DAF limitine ulaştın',
        recording: t('paywall.limitRecording') || 'Günlük kayıt limitine ulaştın',
        general: t('paywall.upgradeTitle') || 'Premium\'a Yükselt',
    };

    const benefits = [
        { icon: Zap, text: t('paywall.benefitUnlimited') || 'Sınırsız egzersiz' },
        { icon: Mic, text: t('paywall.benefitDAF') || 'Sınırsız DAF kullanımı' },
        { icon: BookOpen, text: t('paywall.benefitRecording') || 'Sınırsız ses kaydı' },
        { icon: Sparkles, text: t('paywall.benefitAI') || 'Gelişmiş AI analizi' },
        { icon: Flame, text: t('paywall.benefitStreak') || 'Streak Freeze hakları' },
        { icon: Shield, text: t('paywall.benefitAds') || 'Reklamsız deneyim' },
    ];

    const handleStartTrial = async () => {
        setIsStartingTrial(true);
        try {
            const success = await startTrial();
            if (success) {
                onClose();
            }
        } finally {
            setIsStartingTrial(false);
        }
    };

    const handleUpgrade = () => {
        onClose();
        router.push('/premium');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: "spring", damping: 25 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md bg-card border border-border rounded-t-3xl sm:rounded-3xl overflow-hidden"
                    >
                        {/* Header with gradient */}
                        <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 p-6 text-center relative">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>

                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg mb-4"
                            >
                                <Crown className="w-8 h-8 text-amber-500" />
                            </motion.div>

                            <h2 className="text-xl font-bold text-white mb-1">
                                {triggerMessages[trigger]}
                            </h2>
                            <p className="text-white/80 text-sm">
                                {t('paywall.subtitle') || 'Premium ile tüm özelliklere eriş'}
                            </p>
                        </div>

                        {/* Benefits */}
                        <div className="p-6 space-y-3">
                            {benefits.map((benefit, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + index * 0.05 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <benefit.icon className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="text-sm text-foreground">{benefit.text}</span>
                                    <Check className="w-4 h-4 text-emerald-500 ml-auto" />
                                </motion.div>
                            ))}
                        </div>

                        {/* Free limits info */}
                        <div className="px-6 pb-4">
                            <div className="bg-secondary/50 rounded-xl p-4 text-center text-sm text-muted-foreground">
                                <p className="font-medium mb-1">{t('paywall.freeLimits') || 'Ücretsiz Sürüm Limitleri:'}</p>
                                <p>{FREE_LIMITS.exercisesPerDay} egzersiz • {FREE_LIMITS.dafMinutesPerDay} dk DAF • {FREE_LIMITS.recordingSecondsPerDay} sn kayıt</p>
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="p-6 pt-0 space-y-3">
                            {!isTrialing && (
                                <button
                                    onClick={handleStartTrial}
                                    disabled={isStartingTrial}
                                    className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl text-white font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-shadow disabled:opacity-70"
                                >
                                    {isStartingTrial
                                        ? (t('common.loading') || 'Yükleniyor...')
                                        : (t('paywall.startTrial') || '7 Gün Ücretsiz Dene')
                                    }
                                </button>
                            )}

                            <button
                                onClick={handleUpgrade}
                                className={`w-full py-4 rounded-2xl font-semibold transition-colors ${isTrialing
                                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white'
                                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                                    }`}
                            >
                                {isTrialing
                                    ? `${t('paywall.upgrade') || 'Premium\'a Yükselt'} (${trialDaysLeft} gün kaldı)`
                                    : (t('paywall.seePlans') || 'Planları Gör')
                                }
                            </button>

                            <button
                                onClick={onClose}
                                className="w-full py-2 text-muted-foreground text-sm hover:text-foreground transition-colors"
                            >
                                {t('paywall.maybeLater') || 'Belki daha sonra'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/**
 * Hook to easily show paywall when needed
 */
export function usePaywall() {
    const [isOpen, setIsOpen] = useState(false);
    const [trigger, setTrigger] = useState<'exercise' | 'daf' | 'recording' | 'general'>('general');

    const showPaywall = (reason: typeof trigger = 'general') => {
        setTrigger(reason);
        setIsOpen(true);
    };

    const hidePaywall = () => setIsOpen(false);

    const PaywallComponent = () => (
        <PaywallModal
            isOpen={isOpen}
            onClose={hidePaywall}
            trigger={trigger}
        />
    );

    return {
        showPaywall,
        hidePaywall,
        isOpen,
        PaywallComponent,
    };
}
