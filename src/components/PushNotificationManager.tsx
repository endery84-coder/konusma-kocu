"use client";

import { useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { usePathname } from 'next/navigation';

export function PushNotificationManager() {
    const { isInitialized, requestPermission } = usePushNotifications();
    const pathname = usePathname();

    useEffect(() => {
        // Auto-request permission on certain pages after delay
        if (isInitialized && (pathname === '/home' || pathname === '/')) {
            const hasAsked = localStorage.getItem('push_permission_asked');
            if (!hasAsked) {
                const timer = setTimeout(() => {
                    requestPermission();
                    localStorage.setItem('push_permission_asked', 'true');
                }, 5000); // Ask after 5 seconds on home page
                return () => clearTimeout(timer);
            }
        }
    }, [isInitialized, pathname, requestPermission]);

    return null; // This component handles logic only
}
