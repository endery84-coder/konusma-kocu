"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Animated background shapes
const FloatingShapes = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <motion.div
            className="absolute w-72 h-72 rounded-full bg-gradient-to-r from-teal-500/30 to-cyan-500/30 blur-3xl"
            animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
                scale: [1, 1.2, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            style={{ top: '10%', left: '-10%' }}
        />
        <motion.div
            className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-3xl"
            animate={{
                x: [0, -80, 0],
                y: [0, 100, 0],
                scale: [1, 0.8, 1],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            style={{ top: '50%', right: '-20%' }}
        />
        <motion.div
            className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 blur-3xl"
            animate={{
                x: [0, 50, 0],
                y: [0, -80, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            style={{ bottom: '10%', left: '20%' }}
        />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/40 rounded-full"
                initial={{
                    x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400),
                    y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
                }}
                animate={{
                    y: [null, -20, 0],
                    opacity: [0, 1, 0],
                }}
                transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                }}
            />
        ))}
    </div>
);

// Animated Logo with pulse effect
const AnimatedLogo = () => (
    <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative"
    >
        <motion.div
            animate={{
                boxShadow: [
                    "0 0 0 0 rgba(20, 184, 166, 0.4)",
                    "0 0 0 20px rgba(20, 184, 166, 0)",
                ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl"
        >
            <span className="text-4xl">🎙️</span>
        </motion.div>

        {/* Orbiting dots */}
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
        >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50" />
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50" />
            <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-2 h-2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50" />
            <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-2 h-2 bg-rose-400 rounded-full shadow-lg shadow-rose-400/50" />
        </motion.div>
    </motion.div>
);

// Password strength component
const PasswordStrength = ({ password }: { password: string }) => {
    const checks = [
        { label: 'En az 8 karakter', valid: password.length >= 8 },
        { label: 'Büyük harf', valid: /[A-Z]/.test(password) },
        { label: 'Rakam', valid: /[0-9]/.test(password) },
    ];

    const strength = checks.filter(c => c.valid).length;

    if (!password) return null;

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 space-y-2"
        >
            <div className="flex gap-1">
                {[1, 2, 3].map((level) => (
                    <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${level <= strength
                            ? strength === 1 ? 'bg-red-500' : strength === 2 ? 'bg-amber-500' : 'bg-emerald-500'
                            : 'bg-white/20'
                            }`}
                    />
                ))}
            </div>
            <div className="flex flex-wrap gap-2">
                {checks.map((check) => (
                    <span
                        key={check.label}
                        className={`text-xs flex items-center gap-1 ${check.valid ? 'text-emerald-400' : 'text-white/40'
                            }`}
                    >
                        {check.valid ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {check.label}
                    </span>
                ))}
            </div>
        </motion.div>
    );
};

export default function AuthPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');

    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const passwordsMatch = password === confirmPassword;
    const canSubmitRegister = email && password && confirmPassword && fullName && passwordsMatch && password.length >= 8;
    const canSubmitLogin = email && password;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (activeTab === 'register') {
                if (!passwordsMatch) {
                    setError('Şifreler eşleşmiyor');
                    return;
                }

                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: fullName }
                    }
                });

                if (error) throw error;

                if (data.user) {
                    // Users tablosuna ekle
                    await supabase.from('users').insert({
                        id: data.user.id,
                        email: email,
                        full_name: fullName,
                        is_premium: false,
                        streak_days: 0,
                        total_practice_minutes: 0,
                    });

                    router.push('/onboarding');
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;
                router.push('/');
            }
        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <FloatingShapes />

            <div className="w-full max-w-sm relative z-10">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="flex justify-center mb-6">
                        <AnimatedLogo />
                    </div>

                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-bold text-white mb-2"
                    >
                        KonuşKoç
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-white/60"
                    >
                        Sesini keşfet, özgürce konuş
                    </motion.p>
                </motion.div>

                {/* Form Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl"
                >
                    {/* Tab Switcher */}
                    <div className="flex bg-white/10 rounded-2xl p-1 mb-6">
                        {['login', 'register'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab as 'login' | 'register');
                                    setError('');
                                }}
                                className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-all ${activeTab === tab
                                    ? 'bg-white text-slate-900 shadow-lg'
                                    : 'text-white/70 hover:text-white'
                                    }`}
                            >
                                {tab === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                            </button>
                        ))}
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: activeTab === 'login' ? -20 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: activeTab === 'login' ? 20 : -20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                            >
                                {/* Name (Register only) */}
                                {activeTab === 'register' && (
                                    <div>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-teal-400 focus:bg-white/15 transition-all"
                                                placeholder="Ad Soyad"
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Email */}
                                <div>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-teal-400 focus:bg-white/15 transition-all"
                                            placeholder="Email adresi"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-12 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-teal-400 focus:bg-white/15 transition-all"
                                            placeholder="Şifre"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {activeTab === 'register' && <PasswordStrength password={password} />}
                                </div>

                                {/* Confirm Password (Register only) */}
                                {activeTab === 'register' && (
                                    <div>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className={`w-full pl-12 pr-12 py-3.5 bg-white/10 border rounded-2xl text-white placeholder-white/40 focus:outline-none transition-all ${confirmPassword && !passwordsMatch
                                                    ? 'border-red-500/50 focus:border-red-500'
                                                    : 'border-white/20 focus:border-teal-400'
                                                    }`}
                                                placeholder="Şifre tekrar"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        {confirmPassword && !passwordsMatch && (
                                            <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                                                <X className="w-3 h-3" /> Şifreler eşleşmiyor
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Forgot Password (Login only) */}
                                {activeTab === 'login' && (
                                    <div className="text-right">
                                        <button type="button" className="text-sm text-teal-300 hover:text-teal-200">
                                            Şifremi unuttum
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={isLoading || (activeTab === 'register' ? !canSubmitRegister : !canSubmitLogin)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${isLoading || (activeTab === 'register' ? !canSubmitRegister : !canSubmitLogin)
                                ? 'bg-white/20 text-white/50 cursor-not-allowed'
                                : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50'
                                }`}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {activeTab === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/20" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-4 bg-transparent text-white/40 text-sm">veya</span>
                        </div>
                    </div>

                    {/* Google Button (Coming Soon) */}
                    <button
                        type="button"
                        className="w-full py-3.5 rounded-2xl border border-white/20 bg-white/5 font-medium flex items-center justify-center gap-3 text-white/70 hover:bg-white/10 hover:text-white transition-all"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google ile devam et
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Yakında</span>
                    </button>
                </motion.div>

                {/* Footer */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-sm text-white/40 mt-6"
                >
                    Devam ederek{' '}
                    <a href="/terms" className="text-violet-300 hover:underline">Kullanım Şartları</a>
                    {' '}ve{' '}
                    <a href="/privacy" className="text-violet-300 hover:underline">Gizlilik Politikası</a>
                    'nı kabul etmiş olursunuz.
                </motion.p>
            </div>
        </div>
    );
}
