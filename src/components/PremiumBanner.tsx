"use client";

import { motion } from 'framer-motion';
import { Crown, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PremiumBanner() {
    const router = useRouter();

    return (
        <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/premium')}
            className="w-full p-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-between shadow-lg shadow-amber-500/20"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                    <Crown className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                    <p className="font-semibold text-white">Premium'a Geç</p>
                    <p className="text-sm text-white/80">Tüm özelliklere eriş</p>
                </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white" />
        </motion.button>
    );
}
