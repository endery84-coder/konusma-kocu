"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { supabase } from '@/lib/supabase';
import { Goal, Challenge, challengesByGoal } from '@/types/onboarding';

// Hedef seçenekleri
const goals = [
    { id: 'fluency', label: 'Daha akıcı konuşmak', icon: '🗣️', description: 'Takılmadan, rahat konuşmak istiyorum' },
    { id: 'public_speaking', label: 'Topluluk önünde rahat konuşmak', icon: '🎤', description: 'Sunumlarda ve toplantılarda özgüvenli olmak' },
    { id: 'reading', label: 'Okuma becerimi geliştirmek', icon: '📖', description: 'Daha hızlı ve anlayarak okumak' },
    { id: 'turkish_learning', label: 'Türkçe öğreniyorum', icon: '🇹🇷', description: 'Türkçe telaffuz ve konuşma pratiği' },
    { id: 'child', label: 'Çocuğum için kullanacağım', icon: '👶', description: 'Çocuğumun dil gelişimini desteklemek' },
    { id: 'communication', label: 'Genel iletişimimi güçlendirmek', icon: '✨', description: 'Daha etkili iletişim kurmak' },
];

export default function OnboardingPage() {
    const router = useRouter();
    const { savePreferences } = useUserPreferences();
    const [step, setStep] = useState(1);
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
    const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
    const [dailyGoal, setDailyGoal] = useState(15);
    const [experienceLevel, setExperienceLevel] = useState('beginner');

    // Seçilen hedeflere göre zorlukları dinamik olarak hesapla
    const relevantChallenges = useMemo(() => {
        if (selectedGoals.length === 0) return [];

        const challenges: Challenge[] = [];
        const addedIds = new Set<string>();

        selectedGoals.forEach(goalId => {
            const goalChallenges = challengesByGoal[goalId as Goal] || [];
            goalChallenges.forEach(challenge => {
                if (!addedIds.has(challenge.id)) {
                    challenges.push(challenge);
                    addedIds.add(challenge.id);
                }
            });
        });

        return challenges;
    }, [selectedGoals]);

    // Adım 3 başlığını dinamik yap
    const getChallengesTitle = () => {
        if (selectedGoals.length === 1) {
            const goal = goals.find(g => g.id === selectedGoals[0]);
            return `${goal?.icon} ${goal?.label} konusunda...`;
        }
        return 'Seçtiğin alanlarda...';
    };

    // Adım 3 alt başlığını dinamik yap
    const getChallengesSubtitle = () => {
        return 'Aşağıdakilerden hangilerini yaşıyorsun? (İstersen atlayabilirsin)';
    };

    const handleComplete = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await savePreferences({
                goals: selectedGoals,
                challenges: selectedChallenges,
                daily_goal_minutes: dailyGoal,
                experience_level: experienceLevel,
                onboarding_completed: true,
                onboarding_completed_at: new Date().toISOString()
            })
        }
        router.push('/')
    }

    // Step content render
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        <div className="text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.2 }}
                                className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-6"
                            >
                                <span className="text-4xl">👋</span>
                            </motion.div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                KonuşKoç'a Hoş Geldin!
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">
                                Sana en uygun deneyimi sunmak için birkaç soru soracağız.
                            </p>
                        </div>
                    </motion.div>
                );

            case 2:
                return (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Hangi alanda kendini geliştirmek istiyorsun?
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                Birden fazla seçebilirsin
                            </p>
                        </div>

                        <div className="grid gap-3">
                            {goals.map((goal, index) => (
                                <motion.button
                                    key={goal.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => {
                                        setSelectedGoals(prev =>
                                            prev.includes(goal.id)
                                                ? prev.filter(g => g !== goal.id)
                                                : [...prev, goal.id]
                                        );
                                    }}
                                    className={`
                    relative p-4 rounded-2xl border-2 text-left transition-all duration-200
                    ${selectedGoals.includes(goal.id)
                                            ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                        }
                  `}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-3xl">{goal.icon}</span>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                {goal.label}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {goal.description}
                                            </p>
                                        </div>
                                        {selectedGoals.includes(goal.id) && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                                            >
                                                <Check className="w-4 h-4 text-white" />
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                );

            case 3:
                return (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                    >
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {getChallengesTitle()}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                {getChallengesSubtitle()}
                            </p>
                        </div>

                        {relevantChallenges.length > 0 ? (
                            <div className="grid gap-2 max-h-[400px] overflow-y-auto pr-2">
                                {relevantChallenges.map((challenge, index) => (
                                    <motion.button
                                        key={challenge.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        onClick={() => {
                                            setSelectedChallenges(prev =>
                                                prev.includes(challenge.id)
                                                    ? prev.filter(c => c !== challenge.id)
                                                    : [...prev, challenge.id]
                                            );
                                        }}
                                        className={`
                      p-3 rounded-xl border-2 text-left transition-all duration-200
                      ${selectedChallenges.includes(challenge.id)
                                                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                            }
                    `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{challenge.icon}</span>
                                            <span className="flex-1 text-gray-900 dark:text-white">
                                                {challenge.label}
                                            </span>
                                            {selectedChallenges.includes(challenge.id) && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                                                >
                                                    <Check className="w-3 h-3 text-white" />
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">
                                Önce hedeflerini seç
                            </p>
                        )}

                        {/* "Bunların hiçbiri" seçeneği */}
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            onClick={() => setSelectedChallenges(['none'])}
                            className={`
                w-full p-3 rounded-xl border-2 text-center transition-all
                ${selectedChallenges.includes('none')
                                    ? 'border-gray-400 bg-gray-100 dark:bg-gray-800'
                                    : 'border-gray-200 dark:border-gray-700'
                                }
              `}
                        >
                            <span className="text-gray-600 dark:text-gray-400">
                                Bunların hiçbiri / Söylemek istemiyorum
                            </span>
                        </motion.button>
                    </motion.div>
                );

            case 4:
                return (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        {/* Günlük süre */}
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                                Günde ne kadar zaman ayırabilirsin?
                            </h3>
                            <div className="grid gap-3">
                                {[
                                    { value: 5, label: '5 dakika', icon: '⚡', desc: 'Hızlı pratik' },
                                    { value: 15, label: '10-15 dakika', icon: '⏱️', desc: 'Önerilen' },
                                    { value: 30, label: '20-30 dakika', icon: '🎯', desc: 'Yoğun program' },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setDailyGoal(option.value)}
                                        className={`
                      p-4 rounded-xl border-2 text-left transition-all
                      ${dailyGoal === option.value
                                                ? 'border-primary bg-primary/5'
                                                : 'border-gray-200 dark:border-gray-700'
                                            }
                    `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{option.icon}</span>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                                                <p className="text-sm text-gray-500">{option.desc}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Deneyim seviyesi */}
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                                Daha önce konuşma egzersizi yaptın mı?
                            </h3>
                            <div className="grid gap-3">
                                {[
                                    { value: 'beginner', label: 'Hayır, yeni başlıyorum', icon: '🌱' },
                                    { value: 'intermediate', label: 'Biraz deneyimim var', icon: '📚' },
                                    { value: 'advanced', label: 'Evet, düzenli yapıyorum', icon: '💪' },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => setExperienceLevel(option.value)}
                                        className={`
                      p-4 rounded-xl border-2 text-left transition-all
                      ${experienceLevel === option.value
                                                ? 'border-primary bg-primary/5'
                                                : 'border-gray-200 dark:border-gray-700'
                                            }
                    `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{option.icon}</span>
                                            <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                );

            case 5:
                return (
                    <motion.div
                        key="step5"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-6"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.2 }}
                            className="w-24 h-24 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-full flex items-center justify-center mx-auto"
                        >
                            <Sparkles className="w-12 h-12 text-white" />
                        </motion.div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Harika! Planın Hazır 🎉
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">
                                Senin için kişiselleştirilmiş bir program oluşturduk
                            </p>
                        </div>

                        {/* Özet kartı */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-2xl p-6 text-left"
                        >
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                                📋 Senin Planın
                            </h3>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                    <span className="text-primary">✓</span>
                                    Günlük {dailyGoal} dakika pratik
                                </li>
                                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                    <span className="text-primary">✓</span>
                                    {selectedGoals.map(g => goals.find(x => x.id === g)?.icon).join(' ')} odaklı egzersizler
                                </li>
                                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                    <span className="text-primary">✓</span>
                                    {experienceLevel === 'beginner' ? 'Başlangıç' : experienceLevel === 'intermediate' ? 'Orta' : 'İleri'} seviye içerik
                                </li>
                                <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                    <span className="text-primary">✓</span>
                                    Haftalık ilerleme takibi
                                </li>
                            </ul>
                        </motion.div>
                    </motion.div>
                );
        }
    };

    // Konfeti efekti (son adımda)
    const triggerConfetti = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
            {/* Progress bar */}
            <div className="max-w-md mx-auto mb-8">
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div
                            key={s}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${s <= step ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                                }`}
                        />
                    ))}
                </div>
                <p className="text-center text-sm text-gray-500 mt-2">
                    {step} / 5
                </p>
            </div>

            {/* Content */}
            <div className="max-w-md mx-auto">
                <AnimatePresence mode="wait">
                    {renderStepContent()}
                </AnimatePresence>
            </div>

            {/* Navigation buttons */}
            <div className="max-w-md mx-auto mt-8 flex gap-3">
                {step > 1 && (
                    <button
                        onClick={() => setStep(step - 1)}
                        className="flex-1 py-3 px-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium"
                    >
                        <ChevronLeft className="inline w-5 h-5 mr-1" />
                        Geri
                    </button>
                )}

                <button
                    onClick={() => {
                        if (step === 5) {
                            triggerConfetti();
                            // Save ve yönlendir
                            handleComplete();
                        } else if (step === 3) {
                            // Zorluk soruları atlanabilir
                            setStep(step + 1);
                        } else if (step === 2 && selectedGoals.length === 0) {
                            // En az bir hedef seçilmeli
                            return;
                        } else {
                            setStep(step + 1);
                        }
                    }}
                    disabled={step === 2 && selectedGoals.length === 0}
                    className={`
            flex-1 py-3 px-6 rounded-xl font-medium transition-all
            ${step === 2 && selectedGoals.length === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-primary text-white hover:bg-primary/90'
                        }
          `}
                >
                    {step === 5 ? (
                        <>
                            Başlayalım!
                            <Sparkles className="inline w-5 h-5 ml-1" />
                        </>
                    ) : step === 3 ? (
                        selectedChallenges.length > 0 ? 'Devam' : 'Atla'
                    ) : (
                        <>
                            Devam
                            <ChevronRight className="inline w-5 h-5 ml-1" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
