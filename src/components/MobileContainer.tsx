"use client";

import { ReactNode } from 'react';
import BottomNav from './BottomNav';

interface MobileContainerProps {
    children: ReactNode;
}

export default function MobileContainer({ children }: MobileContainerProps) {
    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            {/* Mobil cihaz çerçevesi */}
            <div className="relative w-full max-w-[430px] min-h-screen md:min-h-[90vh] md:max-h-[900px] md:my-8 md:rounded-[2.5rem] md:border-[8px] md:border-slate-800 md:shadow-2xl md:shadow-black/50 overflow-hidden bg-background">
                {/* Notch (sadece masaüstünde görünür) */}
                <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-800 rounded-b-3xl z-50" />

                {/* Home indicator (sadece masaüstünde görünür) */}
                <div className="hidden md:block absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-600 rounded-full z-50 pointer-events-none" />

                {/* İçerik */}
                <div className="absolute inset-0 overflow-y-auto overflow-x-hidden scroll-smooth pb-safe">
                    {/* Notch için üst boşluk (masaüstünde) */}
                    <div className="hidden md:block h-8 w-full shrink-0" />

                    {/* Asıl içerik */}
                    <div className="min-h-full pb-20 md:pb-8">
                        {children}
                    </div>

                    {/* Home indicator için alt boşluk (masaüstünde) */}
                    <div className="hidden md:block h-6 w-full shrink-0" />
                </div>

                {/* Global Bottom Vax */}
                <BottomNav />
            </div>
        </div>
    );
}
