"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { useServiceWorker } from '@/hooks/usePWA';
import { useLanguage } from '@/lib/i18n/LanguageContext';

/**
 * Component that initializes the Service Worker and shows update notifications.
 * Should be placed in the root layout.
 */
export default function PWAProvider({ children }: { children: React.ReactNode }) {
    const { isUpdateAvailable, updateServiceWorker, isOffline } = useServiceWorker();
    const { t } = useLanguage();
    const [showUpdateBanner, setShowUpdateBanner] = useState(false);

    useEffect(() => {
        if (isUpdateAvailable) {
            setShowUpdateBanner(true);
        }
    }, [isUpdateAvailable]);

    return (
        <>
            {children}

            {/* Update Available Banner */}
            <AnimatePresence>
                {showUpdateBanner && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-24 left-4 right-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-3"
                    >
                        <RefreshCw className="w-5 h-5" />
                        <div className="flex-1 text-sm font-medium">
                            {t('common.updateAvailable') || 'Yeni sürüm mevcut!'}
                        </div>
                        <button
                            onClick={updateServiceWorker}
                            className="px-3 py-1 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
                        >
                            {t('common.update') || 'Güncelle'}
                        </button>
                        <button
                            onClick={() => setShowUpdateBanner(false)}
                            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
