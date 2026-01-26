"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Lock, Play, Clock, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/components/BottomNav';

const categories = [
    { id: 'all', label: 'Tümü', icon: '📋' },
    { id: 'nefes', label: 'Nefes', icon: '💨' },
    { id: 'akicilik', label: 'Akıcılık', icon: '🗣️' },
    { id: 'okuma', label: 'Okuma', icon: '📖' },
    { id: 'telaffuz', label: 'Telaffuz', icon: '🔤' },
    { id: 'sunum', label: 'Sunum', icon: '🎤' },
    { id: 'cocuk', label: 'Çocuk', icon: '🎮' },
];

const difficultyLabels = ['', 'Kolay', 'Orta', 'Zor', 'Uzman'];
const difficultyColors = ['', 'text-emerald-500', 'text-amber-500', 'text-orange-500', 'text-red-500'];

export default function ExercisesPage() {
    const router = useRouter();
    const [exercises, setExercises] = useState<any[]>([]);
    const [filteredExercises, setFilteredExercises] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isPremium, setIsPremium] = useState(false);

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

                console.log('Fetched exercises:', data?.length); // Debug
                setExercises(data || []);
                setFilteredExercises(data || []);
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
        router.push(`/exercises/${exerciseId}`);
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
                    <h1 className="text-xl font-bold text-foreground mb-4">Egzersizler</h1>

                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Egzersiz ara..."
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
                    {filteredExercises.length} egzersiz bulundu
                </p>

                {filteredExercises.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Bu kategoride egzersiz bulunamadı</p>
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
                                        {exercise.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {exercise.description}
                                    </p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {exercise.duration_minutes} dk
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

            <BottomNav />
        </div>
    );
}
