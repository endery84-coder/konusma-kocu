"use client";

import { WifiOff } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export default function OfflineBanner() {
    const isOnline = useNetworkStatus();

    if (isOnline) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-3 animate-in slide-in-from-bottom-5">
            <WifiOff className="w-5 h-5" />
            <div className="text-sm font-medium">
                İnternet bağlantınız yok. Bazı özellikler çalışmayabilir.
            </div>
        </div>
    );
}
