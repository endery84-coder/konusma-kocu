"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Lock, Play, Clock, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/components/BottomNav';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function ExercisesPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [exercises, setExercises] = useState<any[]>([]);
    const [filteredExercises, setFilteredExercises] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isPremium, setIsPremium] = useState(false);

    const categories = [
        { id: 'all', label: t('exercises.categories.all'), icon: '📋' },
        { id: 'nefes', label: t('exercises.categories.nefes'), icon: '💨' },
        { id: 'akicilik', label: t('exercises.categories.akicilik'), icon: '🗣️' },
        { id: 'okuma', label: t('exercises.categories.okuma'), icon: '📖' },
        { id: 'telaffuz', label: t('exercises.categories.telaffuz'), icon: '🔤' },
        { id: 'sunum', label: t('exercises.categories.sunum'), icon: '🎤' },
        { id: 'cocuk', label: t('exercises.categories.cocuk'), icon: '🎮' },
    ];

    const difficultyLabels = ['', t('exercises.difficulty.easy'), t('exercises.difficulty.medium'), t('exercises.difficulty.hard'), t('exercises.difficulty.expert')];
    const difficultyColors = ['', 'text-emerald-500', 'text-amber-500', 'text-orange-500', 'text-red-500'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Premium durumunu kontrol et
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase
                        .from('users')
                        .select('is_premium')
                        .eq('id', user.id)
                        .single();
                    setIsPremium(profile?.is_premium || false);
                }

                // TÜM egzersizleri çek (filtresiz)
                const { data, error } = await supabase
                    .from('exercises')
                    .select('*')
                    .order('difficulty', { ascending: true });

                if (error) {
                    console.error('Exercises fetch error:', error);
                    return;
                }

                setExercises(data || []);

                // Manual Tools Injection (since they might not be in DB yet)
                const tools = [
                    {
                        id: 'rsvp',
                        title: 'Hızlı Okuma (RSVP)',
                        description: 'Kelime kelime okuma hızı geliştirme',
                        category: 'okuma',
                        difficulty: 2,
                        duration_minutes: 5,
                        icon: '⚡',
                        is_premium: false
                    },
                    {
                        id: 'daf',
                        title: 'DAF Asistanı',
                        description: 'Gecikmeli işitsel geri bildirim',
                        category: 'akicilik',
                        difficulty: 3,
                        duration_minutes: 10,
                        icon: '🎧',
                        is_premium: false
                    },
                    {
                        id: 'speech-analysis',
                        title: 'Konuşma Analizi',
                        description: 'Yapay zeka destekli konuşma analizi',
                        category: 'sunum',
                        difficulty: 2,
                        duration_minutes: 3,
                        icon: '📊',
                        is_premium: false
                    },
                    {
                        id: 'teleprompter',
                        title: 'Sunum Asistanı',
                        description: 'Kayan metin ile sunum pratiği',
                        category: 'sunum',
                        difficulty: 2,
                        duration_minutes: 5,
                        icon: '📺',
                        is_premium: false
                    },
                    {
                        id: 'twisters',
                        title: 'Tekerleme Meydan Okuması',
                        description: 'Diksiyon ve telaffuz geliştirme',
                        category: 'telaffuz',
                        difficulty: 3,
                        duration_minutes: 5,
                        icon: '🏆',
                        is_premium: false
                    },
                    {
                        id: 'vocabulary',
                        title: 'Kelime Koçu',
                        description: 'Hedef kelimelerle konuşma pratiği',
                        category: 'telaffuz',
                        difficulty: 1,
                        duration_minutes: 5,
                        icon: '🗣️',
                        is_premium: false
                    },
                    {
                        id: 'pitch',
                        title: 'Ses Analizi',
                        description: 'Ses tonu ve vurgu görselleştirme',
                        category: 'sunum',
                        difficulty: 3,
                        duration_minutes: 3,
                        icon: '📈',
                        is_premium: false
                    }
                ];

                // Combine DB data + Tools
                const allExercises = [...(data || []), ...tools];
                setExercises(allExercises);
                setFilteredExercises(allExercises);

            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filtreleme
    useEffect(() => {
        let result = exercises;

        // Kategori filtresi
        if (selectedCategory !== 'all') {
            result = result.filter(ex => ex.category === selectedCategory);
        }

        // Arama filtresi
        if (searchQuery) {
            result = result.filter(ex =>
                ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ex.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredExercises(result);
    }, [selectedCategory, searchQuery, exercises]);

    const handleExerciseClick = (exerciseId: string) => {
        // Check for custom tool routes
        if (['rsvp', 'daf', 'speech-analysis', 'teleprompter', 'twisters', 'vocabulary', 'pitch'].includes(exerciseId)) {
            router.push(`/exercises/${exerciseId}`);
            return;
        }
        router.push(`/exercises/${exerciseId}`);
    };

    // Helper to translate DB content if a match is found in translations
    const getTranslatedTitle = (exercise: any) => {
        // Custom Tools
        if (exercise.id === 'rsvp') return t('exercises.rsvp.title');
        if (exercise.id === 'daf') return t('exercises.daf.title');
        if (exercise.id === 'speech-analysis') return t('exercises.analysis.title');
        if (exercise.id === 'teleprompter') return t('exercises.teleprompter.title');
        if (exercise.id === 'twisters') return t('exercises.twisters.title');
        if (exercise.id === 'vocabulary') return t('exercises.vocabulary.title');
        if (exercise.id === 'pitch') return t('exercises.pitch.title');

        // Simple mapping based on known IDs or exact string matching
        // In a real app, you might have 'title_key' in DB
        if (exercise.id === 'breathing' || exercise.title === 'Diyafram Nefesi') {
            return t('exercises.breathing.title');
        }
        if (exercise.description === 'Nefes kontrolü') {
            return t('exercises.breathing.desc');
        }
        return exercise.title;
    };

    const getTranslatedDesc = (exercise: any) => {
        if (exercise.id === 'rsvp') return t('exercises.rsvp.desc');
        if (exercise.id === 'daf') return t('exercises.daf.desc');
        if (exercise.id === 'speech-analysis') return t('exercises.analysis.desc');
        if (exercise.id === 'teleprompter') return t('exercises.teleprompter.desc');
        if (exercise.id === 'twisters') return t('exercises.twisters.desc');
        if (exercise.id === 'vocabulary') return t('exercises.vocabulary.desc');
        if (exercise.id === 'pitch') return t('exercises.pitch.desc');

        if (exercise.id === 'breathing' || exercise.description === 'Nefes kontrolü') {
            return t('exercises.breathing.desc');
        }
        return exercise.description;
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="p-4">
                    <h1 className="text-xl font-bold text-foreground mb-4">{t('exercises.title')}</h1>

                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder={t('exercises.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-secondary rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-all ${selectedCategory === cat.id
                                    ? 'bg-primary text-white'
                                    : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                                    }`}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Exercise List */}
            <div className="p-4 space-y-3">
                {/* Count */}
                <p className="text-sm text-muted-foreground">
                    {filteredExercises.length} {filteredExercises.length === 1 ? t('exercises.count_one') : t('exercises.count_other')}
                </p>

                {filteredExercises.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">{t('exercises.notFound')}</p>
                    </div>
                ) : (
                    filteredExercises.map((exercise, index) => (
                        <motion.button
                            key={exercise.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() => handleExerciseClick(exercise.id)}
                            className="w-full relative bg-card rounded-2xl p-4 border border-border hover:border-primary/50 hover:shadow-md transition-all text-left"
                        >
                            {/* Premium overlay */}
                            {exercise.is_premium && !isPremium && (
                                <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-10">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-full">
                                        <Lock className="w-3.5 h-3.5" />
                                        Premium
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                {/* Icon */}
                                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                                    {exercise.icon || '🎯'}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-foreground truncate">
                                        {getTranslatedTitle(exercise)}
                                    </h3>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {getTranslatedDesc(exercise)}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {exercise.duration_minutes} {t('progress.minutes')}
                                        </span>
                                        <span className={`text-xs font-medium ${difficultyColors[exercise.difficulty]}`}>
                                            {difficultyLabels[exercise.difficulty]}
                                        </span>
                                    </div>
                                </div>

                                {/* Play button */}
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Play className="w-4 h-4 text-primary" />
                                </div>
                            </div>
                        </motion.button>
                    ))
                )}
            </div>


        </div>
    );
}
