"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Check, Crown, Zap, Shield, Sparkles,
    Star, Clock, Mic, BookOpen, X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const plans = [
    {
        id: 'monthly',
        name: 'Aylık',
        price: 79,
        period: 'ay',
        popular: false,
    },
    {
        id: 'yearly',
        name: 'Yıllık',
        price: 599,
        period: 'yıl',
        monthlyPrice: 50,
        savings: '37%',
        popular: true,
    },
];

const features = [
    { icon: Mic, text: 'Sınırsız ses kaydı' },
    { icon: Zap, text: 'DAF ve Metronom araçları' },
    { icon: BookOpen, text: 'Tüm egzersizlere erişim' },
    { icon: Sparkles, text: 'AI destekli geri bildirim' },
    { icon: Clock, text: 'Kişiselleştirilmiş programlar' },
    { icon: Shield, text: 'Reklamsız deneyim' },
    { icon: Star, text: 'Öncelikli destek' },
];

export default function PremiumPage() {
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState('yearly');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handlePurchase = async () => {
        setIsLoading(true);

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Update user to premium
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase
                    .from('users')
                    .update({
                        is_premium: true,
                        premium_started_at: new Date().toISOString(),
                        premium_plan: selectedPlan,
                    })
                    .eq('id', user.id);
            }

            setShowSuccess(true);

            // Redirect after success
            setTimeout(() => {
                router.push('/');
            }, 3000);

        } catch (error) {
            console.error('Payment error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <Crown className="w-12 h-12 text-white" />
                    </motion.div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                        Premium'a Hoş Geldin! 🎉
                    </h1>
                    <p className="text-muted-foreground">
                        Artık tüm özelliklere erişebilirsin.
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-safe">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="flex items-center justify-between p-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-xl">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="font-semibold text-foreground">Premium</h1>
                    <div className="w-9" />
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-6"
                >
                    <motion.div
                        animate={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30"
                    >
                        <Crown className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">
                        KonuşKoç Premium
                    </h1>
                    <p className="text-muted-foreground">
                        Konuşma becerilerini sınırsız geliştir
                    </p>
                </motion.div>

                {/* Plan Selection */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 gap-3"
                >
                    {plans.map((plan) => (
                        <button
                            key={plan.id}
                            onClick={() => setSelectedPlan(plan.id)}
                            className={`relative p-4 rounded-2xl border-2 transition-all ${selectedPlan === plan.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border bg-card'
                                }`}
                        >
                            {plan.popular && (
                                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-full">
                                    Popüler
                                </span>
                            )}
                            <p className="text-sm text-muted-foreground mb-1">{plan.name}</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-foreground">₺{plan.price}</span>
                                <span className="text-muted-foreground text-sm">/{plan.period}</span>
                            </div>
                            {plan.savings && (
                                <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-xs font-medium rounded-full">
                                    %{plan.savings} tasarruf
                                </span>
                            )}
                            {selectedPlan === plan.id && (
                                <motion.div
                                    layoutId="selectedIndicator"
                                    className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                                >
                                    <Check className="w-3 h-3 text-white" />
                                </motion.div>
                            )}
                        </button>
                    ))}
                </motion.div>

                {/* Features Comparison */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-card rounded-2xl border border-border overflow-hidden"
                >
                    {/* Free vs Premium Header */}
                    <div className="grid grid-cols-3 border-b border-border">
                        <div className="p-3" />
                        <div className="p-3 text-center border-l border-border">
                            <p className="text-sm font-medium text-muted-foreground">Ücretsiz</p>
                        </div>
                        <div className="p-3 text-center border-l border-border bg-primary/5">
                            <p className="text-sm font-medium text-primary">Premium</p>
                        </div>
                    </div>

                    {/* Feature rows */}
                    {[
                        { feature: 'Günlük egzersiz', free: '3', premium: 'Sınırsız' },
                        { feature: 'Ses kaydı', free: '5 dk/gün', premium: 'Sınırsız' },
                        { feature: 'DAF modu', free: false, premium: true },
                        { feature: 'Metronom', free: false, premium: true },
                        { feature: 'AI geri bildirim', free: false, premium: true },
                        { feature: 'Premium egzersizler', free: false, premium: true },
                        { feature: 'Reklam', free: 'Var', premium: 'Yok' },
                    ].map((row, index) => (
                        <div key={index} className="grid grid-cols-3 border-b border-border last:border-0">
                            <div className="p-3 text-sm text-foreground">{row.feature}</div>
                            <div className="p-3 text-center border-l border-border">
                                {typeof row.free === 'boolean' ? (
                                    row.free ? (
                                        <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                                    ) : (
                                        <X className="w-4 h-4 text-muted-foreground mx-auto" />
                                    )
                                ) : (
                                    <span className="text-sm text-muted-foreground">{row.free}</span>
                                )}
                            </div>
                            <div className="p-3 text-center border-l border-border bg-primary/5">
                                {typeof row.premium === 'boolean' ? (
                                    row.premium ? (
                                        <Check className="w-4 h-4 text-primary mx-auto" />
                                    ) : (
                                        <X className="w-4 h-4 text-muted-foreground mx-auto" />
                                    )
                                ) : (
                                    <span className="text-sm font-medium text-primary">{row.premium}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* All Features List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-card rounded-2xl p-5 border border-border"
                >
                    <h3 className="font-semibold text-foreground mb-4">
                        Premium ile neler kazanırsın?
                    </h3>
                    <div className="space-y-3">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + index * 0.05 }}
                                className="flex items-center gap-3"
                            >
                                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <feature.icon className="w-4 h-4 text-primary" />
                                </div>
                                <span className="text-foreground">{feature.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Guarantee */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20"
                >
                    <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-foreground">7 Gün İade Garantisi</p>
                            <p className="text-sm text-muted-foreground">
                                Memnun kalmazsan ilk 7 gün içinde tam iade.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Purchase Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="sticky bottom-4 pt-4"
                >
                    <button
                        onClick={handlePurchase}
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 disabled:opacity-70"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Crown className="w-5 h-5" />
                                Premium'a Geç - ₺{plans.find(p => p.id === selectedPlan)?.price}/{plans.find(p => p.id === selectedPlan)?.period}
                            </>
                        )}
                    </button>
                    <p className="text-center text-xs text-muted-foreground mt-3">
                        İstediğin zaman iptal edebilirsin
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
