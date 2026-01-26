"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sun, Moon, Sunset, Sparkles, TrendingUp, Mic, BookOpen,
  Target, Play, Flame, Clock, ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BottomNav from '@/components/BottomNav';

// Greeting helper
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) return { text: 'İyi geceler', icon: Moon, emoji: '🌙' };
  if (hour < 12) return { text: 'Günaydın', icon: Sun, emoji: '☀️' };
  if (hour < 18) return { text: 'İyi günler', icon: Sun, emoji: '🌤️' };
  return { text: 'İyi akşamlar', icon: Sunset, emoji: '🌆' };
};

// Daily quotes
const quotes = [
  { text: "Her adım seni hedefe yaklaştırıyor.", author: null },
  { text: "Bugün dünden daha güçlüsün.", author: null },
  { text: "Pratik mükemmelleştirir.", author: null },
  { text: "Sesin benzersiz ve değerli.", author: null },
  { text: "Küçük adımlar, büyük değişimler.", author: null },
];

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [preferences, setPreferences] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const greeting = getGreeting();
  const dailyQuote = quotes[new Date().getDate() % quotes.length];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          router.push('/auth');
          return;
        }

        // User profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        // Preferences
        const { data: prefs } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', authUser.id)
          .single();

        // Exercises
        const { data: exerciseData } = await supabase
          .from('exercises')
          .select('*')
          .limit(5);

        setUser({
          ...profile,
          email: authUser.email,
          fullName: profile?.full_name || authUser.user_metadata?.full_name || 'Kullanıcı',
        });
        setPreferences(prefs);
        setExercises(exerciseData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const dailyGoalMinutes = preferences?.daily_goal_minutes || 15;
  const todayMinutes = (user?.total_practice_minutes || 0) % dailyGoalMinutes;
  const progressPercent = Math.min((todayMinutes / dailyGoalMinutes) * 100, 100);
  const firstName = user?.fullName?.split(' ')[0] || 'Kullanıcı';

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header Section */}
      <div className="px-4 pt-12 pb-6">
        {/* Top Row: Greeting + Avatar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <p className="text-muted-foreground text-sm flex items-center gap-1.5">
              {greeting.emoji} {greeting.text}
            </p>
            <h1 className="text-2xl font-bold text-foreground mt-0.5">
              {firstName}
            </h1>
          </div>

          <button
            onClick={() => router.push('/profile')}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20"
          >
            <span className="text-white font-semibold text-sm">
              {firstName[0]?.toUpperCase()}
            </span>
          </button>
        </motion.div>

        {/* Quote Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-4 shadow-lg shadow-teal-500/20"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <p className="text-white font-medium flex-1">
              "{dailyQuote.text}"
            </p>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="px-4 space-y-5">
        {/* Daily Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-5 shadow-sm border border-border"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-teal-500/10 rounded-xl">
                <Target className="w-5 h-5 text-teal-500" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Günlük Hedef</h2>
                <p className="text-sm text-muted-foreground">
                  {todayMinutes} / {dailyGoalMinutes} dakika
                </p>
              </div>
            </div>
            <span className="text-2xl font-bold text-gradient">
              %{Math.round(progressPercent)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
            />
          </div>

          {progressPercent < 100 && (
            <button
              onClick={() => router.push('/exercises')}
              className="w-full mt-4 py-3 bg-gradient-primary text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 hover:opacity-90 transition-opacity"
            >
              <Play className="w-4 h-4" />
              Egzersize Başla
            </button>
          )}
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="bg-card rounded-2xl p-4 text-center border border-border">
            <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-xl font-bold text-foreground">{user?.streak_days || 0}</p>
            <p className="text-xs text-muted-foreground">Gün Serisi</p>
          </div>

          <div className="bg-card rounded-2xl p-4 text-center border border-border">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-xl font-bold text-foreground">{user?.total_practice_minutes || 0}</p>
            <p className="text-xs text-muted-foreground">Dakika</p>
          </div>

          <div className="bg-card rounded-2xl p-4 text-center border border-border">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-xl font-bold text-foreground">{exercises.length}</p>
            <p className="text-xs text-muted-foreground">Egzersiz</p>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-3 mb-6"
        >
          <button
            onClick={() => router.push('/record')}
            className="bg-card rounded-2xl p-4 border border-border hover:border-primary/50 transition-all flex flex-col items-center gap-2 group"
          >
            <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
              <Mic className="w-6 h-6 text-teal-500" />
            </div>
            <span className="font-medium text-foreground">Ses Kaydı</span>
            <span className="text-xs text-muted-foreground">Hemen başla</span>
          </button>

          <button
            onClick={() => router.push('/exercises')}
            className="bg-card rounded-2xl p-4 border border-border hover:border-primary/50 transition-all flex flex-col items-center gap-2 group"
          >
            <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
              <BookOpen className="w-6 h-6 text-cyan-500" />
            </div>
            <span className="font-medium text-foreground">Egzersizler</span>
            <span className="text-xs text-muted-foreground">Tümünü gör</span>
          </button>
        </motion.div>

        {/* Today's Exercises */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">Bugünün Egzersizleri</h2>
            <button
              onClick={() => router.push('/exercises')}
              className="text-sm text-primary font-medium flex items-center gap-1"
            >
              Tümü <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {exercises.length > 0 ? (
              exercises.slice(0, 3).map((exercise, index) => (
                <motion.button
                  key={exercise.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  onClick={() => router.push(`/exercises/${exercise.id}`)}
                  className="w-full bg-card rounded-2xl p-4 flex items-center gap-4 border border-border hover:border-primary/50 hover:shadow-md transition-all group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${index === 0 ? 'bg-teal-500/10' :
                    index === 1 ? 'bg-cyan-500/10' :
                      'bg-blue-500/10'
                    }`}>
                    {exercise.icon || '🎯'}
                  </div>

                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {exercise.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {exercise.duration_minutes} dk • {
                        exercise.difficulty === 1 ? 'Kolay' :
                          exercise.difficulty === 2 ? 'Orta' : 'Zor'
                      }
                    </p>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                    <Play className="w-4 h-4 text-primary group-hover:text-white transition-colors" />
                  </div>
                </motion.button>
              ))
            ) : (
              <div className="bg-card rounded-2xl p-6 text-center border border-border">
                <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Henüz egzersiz yok</p>
                <button
                  onClick={() => router.push('/exercises')}
                  className="mt-3 text-primary font-medium"
                >
                  Egzersizlere göz at
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
