"use client";

import { useEffect, useState, useCallback } from 'react';

/**
 * Hook for managing Service Worker registration and updates.
 * Registers the SW on mount and provides update functionality.
 */
export function useServiceWorker() {
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
    const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        // Check online status
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        setIsOffline(!navigator.onLine);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then((reg) => {
                    console.log('[App] Service Worker registered');
                    setRegistration(reg);

                    // Check for updates
                    reg.addEventListener('updatefound', () => {
                        const newWorker = reg.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // New version available
                                    setIsUpdateAvailable(true);
                                    console.log('[App] New version available');
                                }
                            });
                        }
                    });
                })
                .catch((error) => {
                    console.error('[App] Service Worker registration failed:', error);
                });
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    /**
     * Force update to new service worker version
     */
    const updateServiceWorker = useCallback(() => {
        if (registration?.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        }
    }, [registration]);

    return {
        registration,
        isUpdateAvailable,
        isOffline,
        updateServiceWorker,
    };
}

/**
 * Hook for managing push notifications.
 * Handles permission requests and subscription management.
 */
export function usePushNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        // Check if push notifications are supported
        const supported = 'Notification' in window && 'PushManager' in window && 'serviceWorker' in navigator;
        setIsSupported(supported);

        if (supported) {
            setPermission(Notification.permission);
        }
    }, []);

    /**
     * Request notification permission from user
     */
    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (!isSupported) return false;

        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result === 'granted';
        } catch (error) {
            console.error('[Push] Permission request failed:', error);
            return false;
        }
    }, [isSupported]);

    /**
     * Subscribe to push notifications
     */
    const subscribe = useCallback(async (): Promise<PushSubscription | null> => {
        if (!isSupported || permission !== 'granted') return null;

        try {
            const registration = await navigator.serviceWorker.ready;

            // For demo purposes, we're not using a real VAPID key
            // In production, you'd get this from your backend
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                // applicationServerKey would go here in production
            });

            setSubscription(subscription);
            console.log('[Push] Subscribed:', subscription);

            // In production, send subscription to your backend
            // await sendSubscriptionToServer(subscription);

            return subscription;
        } catch (error) {
            console.error('[Push] Subscription failed:', error);
            return null;
        }
    }, [isSupported, permission]);

    /**
     * Unsubscribe from push notifications
     */
    const unsubscribe = useCallback(async (): Promise<boolean> => {
        if (!subscription) return false;

        try {
            await subscription.unsubscribe();
            setSubscription(null);
            console.log('[Push] Unsubscribed');
            return true;
        } catch (error) {
            console.error('[Push] Unsubscribe failed:', error);
            return false;
        }
    }, [subscription]);

    /**
     * Send a local notification (for testing)
     */
    const sendTestNotification = useCallback(async () => {
        if (permission !== 'granted') return;

        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification('KonuşKoç Test', {
            body: 'Bildirimler çalışıyor! 🎉',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: 'test',
        });
    }, [permission]);

    return {
        permission,
        subscription,
        isSupported,
        requestPermission,
        subscribe,
        unsubscribe,
        sendTestNotification,
    };
}
