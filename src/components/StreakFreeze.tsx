"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Snowflake, AlertTriangle, CheckCircle, X, Crown } from 'lucide-react';
import { useStreak } from '@/hooks/useStreak';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { toast } from 'sonner';

interface StreakFreezeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade?: () => void;
}

/**
 * Modal to use streak freeze when streak is at risk
 */
export function StreakFreezeModal({ isOpen, onClose, onUpgrade }: StreakFreezeModalProps) {
    const { t } = useLanguage();
    const { streak, useStreakFreeze } = useStreak();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleUseFreeze = async () => {
        setIsProcessing(true);
        try {
            const success = await useStreakFreeze();
            if (success) {
                toast.success(t('streak.freezeUsed') || '❄️ Streak Freeze kullanıldı!', {
                    description: t('streak.streakSaved') || 'Serin korundu!',
                });
                onClose();
            } else {
                toast.error(t('streak.noFreezes') || 'Streak Freeze hakkın kalmadı');
            }
        } catch {
            toast.error(t('common.error') || 'Bir hata oluştu');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-card border border-border rounded-3xl p-6 max-w-sm w-full shadow-2xl"
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full"
                        >
                            <X className="w-5 h-5 text-muted-foreground" />
                        </button>

                        {/* Icon */}
                        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/30">
                            <Snowflake className="w-10 h-10 text-white" />
                        </div>

                        {/* Title */}
                        <h2 className="text-xl font-bold text-center text-foreground mb-2">
                            {t('streak.atRisk') || 'Seri Tehlikede! 🔥'}
                        </h2>

                        {/* Current streak */}
                        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-4">
                            <div className="flex items-center justify-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                                <span className="text-orange-500 font-semibold">
                                    {streak.currentStreak} {t('streak.dayStreak') || 'günlük seri'}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground text-center mt-2">
                                {t('streak.willLose') || 'Bugün pratik yapmazsan kaybedeceksin!'}
                            </p>
                        </div>

                        {/* Freeze status */}
                        {streak.freezesRemaining > 0 ? (
                            <>
                                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mb-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-cyan-600 font-medium">
                                            {t('streak.freezesLeft') || 'Kalan Freeze'}
                                        </span>
                                        <div className="flex gap-1">
                                            {Array.from({ length: streak.freezesRemaining }).map((_, i) => (
                                                <Snowflake key={i} className="w-5 h-5 text-cyan-500" />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleUseFreeze}
                                    disabled={isProcessing || streak.freezeUsedToday}
                                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                                >
                                    {isProcessing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            {t('common.processing') || 'İşleniyor...'}
                                        </span>
                                    ) : streak.freezeUsedToday ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <CheckCircle className="w-5 h-5" />
                                            {t('streak.alreadyUsed') || 'Bugün kullanıldı'}
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <Snowflake className="w-5 h-5" />
                                            {t('streak.useFreeze') || 'Streak Freeze Kullan'}
                                        </span>
                                    )}
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="bg-slate-500/10 border border-slate-500/30 rounded-xl p-4 mb-4 text-center">
                                    <Snowflake className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm text-muted-foreground">
                                        {t('streak.noFreezesLeft') || 'Streak Freeze hakkın kalmadı'}
                                    </p>
                                </div>

                                <button
                                    onClick={onUpgrade}
                                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 mb-3"
                                >
                                    <Crown className="w-5 h-5" />
                                    {t('streak.getPremium') || 'Premium ile Freeze Al'}
                                </button>
                            </>
                        )}

                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-secondary text-foreground font-medium rounded-xl"
                        >
                            {t('streak.practiceNow') || 'Şimdi Pratik Yap'}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/**
 * Small streak indicator with freeze badge for header
 */
export function StreakIndicator() {
    const { streak, isLoading } = useStreak();
    const [showModal, setShowModal] = useState(false);

    if (isLoading) {
        return <div className="w-12 h-6 bg-secondary rounded animate-pulse" />;
    }

    return (
        <>
            <div
                onClick={() => streak.streakAtRisk && setShowModal(true)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${streak.streakAtRisk
                        ? 'bg-orange-500/20 cursor-pointer animate-pulse'
                        : 'bg-orange-500/10'
                    }`}
            >
                <span className="text-lg">🔥</span>
                <span className={`font-bold text-sm ${streak.streakAtRisk ? 'text-orange-500' : 'text-foreground'}`}>
                    {streak.currentStreak}
                </span>
                {streak.freezesRemaining > 0 && (
                    <div className="flex items-center gap-0.5 ml-1 text-cyan-500">
                        <Snowflake className="w-3 h-3" />
                        <span className="text-xs font-medium">{streak.freezesRemaining}</span>
                    </div>
                )}
            </div>

            <StreakFreezeModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />
        </>
    );
}
