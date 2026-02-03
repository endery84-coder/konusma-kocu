"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Flame, Clock, Target, ChevronRight,
  Wind, BookOpen, Mic, Sliders,
  Sparkles, TrendingUp, Trophy
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { dailyQuotes } from '@/lib/data/quotes';
import { toast } from 'sonner';
import { TIME_THRESHOLDS } from '@/lib/constants';
import { DailyTasksWidget } from '@/components/DailyTasksWidget';

export default function HomePage() {
  const router = useRouter();
  const { t, language } = useLanguage(); // Hook'u kullan
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [dailyQuote, setDailyQuote] = useState({ text: '', author: '' });

  useEffect(() => {
    // Selamlama mesajı
    const hour = new Date().getHours();
    if (hour < TIME_THRESHOLDS.MORNING_END) setGreeting('morning');
    else if (hour < TIME_THRESHOLDS.AFTERNOON_END) setGreeting('afternoon');
    else setGreeting('evening');

    // Günlük alıntı (Dil bazlı)
    // Günlük alıntı (Dil bazlı)
    // NOTE: We must access language from the hook which is already called at component level. 
    // We cannot call useLanguage() inside useEffect again.
    // However, we need 'language' from the hook. Let's update the destructuring above.
    const quotes = dailyQuotes[language as keyof typeof dailyQuotes] || dailyQuotes['en'];
    setDailyQuote({ text: quotes[Math.floor(Math.random() * quotes.length)], author: '' });

    // Bildirim İzni İsteyelim (Retention için)
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      setTimeout(() => {
        Notification.requestPermission();
      }, 5000);
    }

    // Kullanıcı bilgisi
    const fetchUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          router.push('/welcome');
          return;
        }

        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', authUser.id)
          .single();

        setUser({
          ...profile,
          preferences,
          firstName: profile?.full_name?.split(' ')[0] || t('common.user')
        });

        // Streak Warning Logic
        if ((profile?.streak_days || 0) > 0) {
          const { data: lastProgress } = await supabase
            .from('user_progress')
            .select('completed_at')
            .eq('user_id', authUser.id)
            .order('completed_at', { ascending: false })
            .limit(1)
            .single();

          const lastDate = lastProgress ? new Date(lastProgress.completed_at) : null;
          const today = new Date();
          const isToday = lastDate &&
            lastDate.getDate() === today.getDate() &&
            lastDate.getMonth() === today.getMonth() &&
            lastDate.getFullYear() === today.getFullYear();

          if (!isToday && today.getHours() >= 18) {
            const warningMsg = t('home.streakWarning');
            toast.warning(warningMsg, { duration: 6000 });

            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('KonuşKoç', { body: warningMsg, icon: '/icon.png' });
            }
          }
        }
      } catch {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router, t, language]);

  const quickActions = [
    { icon: Wind, label: t('home.quickActions.breath'), href: '/exercises?category=breathing', color: 'from-blue-500 to-cyan-500' },
    { icon: BookOpen, label: t('home.quickActions.reading'), href: '/exercises?category=reading', color: 'from-purple-500 to-pink-500' },
    { icon: Mic, label: t('home.quickActions.record'), href: '/record', color: 'from-teal-500 to-emerald-500' },
    { icon: Sliders, label: t('home.quickActions.daf'), href: '/record?tool=daf', color: 'from-orange-500 to-amber-500' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const streakDays = user?.streak_days || 0;
  const dailyGoalMinutes = user?.preferences?.daily_goal_minutes || 10;
  const todayMinutes = 0; // Bu gerçek veriden gelecek
  const goalProgress = Math.min((todayMinutes / dailyGoalMinutes) * 100, 100);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 px-5 pt-12 pb-8 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white/80 text-sm">{t(`home.greeting.${greeting}`)} 👋</p>
            <h1 className="text-white text-xl font-bold">{user?.full_name || user?.firstName || t('common.user')}</h1>
          </div>
          <motion.div
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/progress')}
            className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-xl cursor-pointer"
          >
            <Flame className="w-5 h-5 text-orange-300" />
            <span className="text-white font-semibold">{streakDays}</span>
          </motion.div>
        </div>

        {/* Daily Goal Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-white" />
              <span className="text-white font-medium">{t('home.dailyGoal')}</span>
            </div>
            <span className="text-white/80 text-sm">{todayMinutes}/{dailyGoalMinutes} dk</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${goalProgress}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-full bg-white rounded-full"
            />
          </div>
          {goalProgress >= 100 ? (
            <p className="text-white/80 text-xs mt-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {t('home.goalCompleted')}
            </p>
          ) : (
            <p className="text-white/80 text-xs mt-2">
              {dailyGoalMinutes - todayMinutes} {t('home.morePractice')}
            </p>
          )}
        </motion.div>
      </div>

      <div className="px-5 -mt-4 space-y-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-3"
        >
          {quickActions.map((action, index) => (
            <motion.button
              key={action.label}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              onClick={() => router.push(action.href)}
              className="flex flex-col items-center gap-2 p-3 bg-card rounded-2xl border border-border"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-foreground font-medium">{action.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Leaderboard Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onClick={() => router.push('/leaderboard')}
          className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-yellow-500/20 transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{t('leaderboard.title') || 'Sıralama'}</h3>
            <p className="text-xs text-muted-foreground">{t('leaderboard.weeklyRank') || 'Haftalık sıralamada yerini gör'}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground rtl-flip" />
        </motion.div>

        {/* Daily Tasks Widget */}
        <DailyTasksWidget />

        {/* Recommended Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-foreground font-semibold">{t('home.recommended')}</h2>
            <button
              onClick={() => router.push('/exercises')}
              className="text-primary text-sm flex items-center gap-1"
            >
              {t('home.viewAll')} <ChevronRight className="w-4 h-4 rtl-flip" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Exercise Card 1 */}
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/exercises')}
              className="bg-card rounded-2xl p-4 border border-border flex items-center gap-4 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-2xl">
                🫁
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">{t('exercises.breathing.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('exercises.breathing.desc')} • 5 {t('progress.minutes')}</p>
              </div>
              <div className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-lg">
                +15 XP
              </div>
            </motion.div>

            {/* Exercise Card 2 */}
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/exercises')}
              className="bg-card rounded-2xl p-4 border border-border flex items-center gap-4 cursor-pointer"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                📖
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">{t('exercises.rsvp.title')}</h3>
                <p className="text-sm text-muted-foreground">{t('exercises.rsvp.desc')} • 10 {t('progress.minutes')}</p>
              </div>
              <div className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-lg">
                +20 XP
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Daily Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 border border-slate-700"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-slate-400">{t('home.dailyQuote')}</span>
          </div>
          <p className="text-white font-medium mb-2">"{dailyQuote.text}"</p>
          <p className="text-slate-400 text-sm opacity-50">Konuşma Koçun</p>
        </motion.div>

        {/* Progress Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => router.push('/progress')}
          className="bg-card rounded-2xl p-4 border border-border flex items-center gap-4 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-foreground">{t('home.progressReport')}</h3>
            <p className="text-sm text-muted-foreground">{t('home.progressDesc', { minutes: user?.total_practice_minutes || 0 })}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground rtl-flip" />
        </motion.div>
      </div>


    </div>
  );
}
