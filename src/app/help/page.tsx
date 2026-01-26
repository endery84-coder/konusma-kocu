"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, ChevronDown, Mail, MessageCircle, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

const faqs = [
    {
        category: 'Genel',
        questions: [
            {
                q: 'KonuşKoç nedir?',
                a: 'KonuşKoç, konuşma becerilerinizi geliştirmenize yardımcı olan kişiselleştirilmiş bir dil ve konuşma terapisi uygulamasıdır.'
            },
            {
                q: 'Uygulama ücretsiz mi?',
                a: 'Temel özellikler ücretsizdir. Premium üyelik ile tüm egzersizlere ve gelişmiş özelliklere erişebilirsiniz.'
            },
            {
                q: 'Hangi cihazlarda kullanabilirim?',
                a: 'KonuşKoç web tarayıcısı olan tüm cihazlarda çalışır. Mobil uygulamamız da yakında gelecek!'
            },
        ]
    },
    {
        category: 'Egzersizler',
        questions: [
            {
                q: 'DAF nedir?',
                a: 'DAF (Delayed Auditory Feedback), kendi sesinizi gecikmeli duymanızı sağlayan bir tekniktir. Konuşma hızını doğal olarak yavaşlatır.'
            },
            {
                q: 'Günde ne kadar pratik yapmalıyım?',
                a: 'En iyi sonuçlar için günde 10-15 dakika düzenli pratik öneriyoruz. Az ama düzenli pratik, uzun ama düzensiz pratikten daha etkilidir.'
            },
            {
                q: 'Egzersizler kişiselleştirilmiş mi?',
                a: 'Evet! Kayıt olurken belirlediğiniz hedefler ve zorluklara göre size özel bir program oluşturulur.'
            },
        ]
    },
    {
        category: 'Hesap',
        questions: [
            {
                q: 'Şifremi unuttum, ne yapmalıyım?',
                a: 'Giriş ekranında "Şifremi Unuttum" linkine tıklayın. Email adresinize şifre sıfırlama linki göndereceğiz.'
            },
            {
                q: 'Hesabımı nasıl silerim?',
                a: 'Ayarlar > Gizlilik > Hesabı Sil yolunu izleyerek hesabınızı kalıcı olarak silebilirsiniz.'
            },
            {
                q: 'Premium üyeliği nasıl iptal ederim?',
                a: 'Ayarlar > Abonelik bölümünden üyeliğinizi istediğiniz zaman iptal edebilirsiniz.'
            },
        ]
    },
];

export default function HelpPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [openQuestion, setOpenQuestion] = useState<string | null>(null);

    const filteredFaqs = faqs.map(cat => ({
        ...cat,
        questions: cat.questions.filter(
            q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.questions.length > 0);

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
                <div className="flex items-center gap-4 p-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-xl">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-xl font-bold">Yardım & Destek</h1>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Soru ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-muted rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                {/* Contact Options */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { icon: Mail, label: 'Email', action: () => window.location.href = 'mailto:destek@konuskoc.com' },
                        { icon: MessageCircle, label: 'Canlı Destek', action: () => { } },
                        { icon: Phone, label: 'Ara', action: () => window.location.href = 'tel:+905551234567' },
                    ].map((item) => (
                        <motion.button
                            key={item.label}
                            whileTap={{ scale: 0.95 }}
                            onClick={item.action}
                            className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl shadow-sm hover:bg-muted transition-colors"
                        >
                            <item.icon className="w-6 h-6 text-primary" />
                            <span className="text-sm font-medium">{item.label}</span>
                        </motion.button>
                    ))}
                </div>

                {/* FAQs */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">Sık Sorulan Sorular</h2>

                    {filteredFaqs.map((category) => (
                        <div key={category.category} className="mb-6">
                            <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-2">
                                {category.category}
                            </h3>
                            <div className="bg-card rounded-2xl overflow-hidden shadow-sm">
                                {category.questions.map((item, index) => (
                                    <div
                                        key={item.q}
                                        className={index !== category.questions.length - 1 ? 'border-b border-border' : ''}
                                    >
                                        <button
                                            onClick={() => setOpenQuestion(openQuestion === item.q ? null : item.q)}
                                            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                                        >
                                            <span className="font-medium pr-4">{item.q}</span>
                                            <ChevronDown
                                                className={`w-5 h-5 text-muted-foreground transition-transform ${openQuestion === item.q ? 'rotate-180' : ''
                                                    }`}
                                            />
                                        </button>
                                        <AnimatePresence>
                                            {openQuestion === item.q && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <p className="px-4 pb-4 text-muted-foreground">
                                                        {item.a}
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
