"use client";

import { useEffect, useState } from 'react';
import OneSignal from 'react-onesignal';

const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || 'YOUR-ONESIGNAL-APP-ID';

export function usePushNotifications() {
    const [isInitialized, setIsInitialized] = useState(false);
    const [permission, setPermission] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const initOneSignal = async () => {
            try {
                await OneSignal.init({
                    appId: ONESIGNAL_APP_ID,
                    safari_web_id: "web.onesignal.auto.xxxxx", // Optional
                    allowLocalhostAsSecureOrigin: true, // For dev
                });

                setIsInitialized(true);
                const currentPermission = OneSignal.Notifications.permission;
                setPermission(currentPermission);

                // Add event listener for permission change
                // Note: OneSignal generic event listening might differ by version, simple poll or check on action is easier
            } catch (error) {
                console.error('OneSignal init error:', error);
            }
        };

        initOneSignal();
    }, []);

    const requestPermission = async () => {
        try {
            await OneSignal.Notifications.requestPermission();
            const currentPermission = OneSignal.Notifications.permission;
            setPermission(currentPermission);
            return currentPermission;
        } catch (error) {
            console.error('Error requesting permission:', error);
            return false;
        }
    };

    /**
     * Send a tag to segment users (e.g. level, premium status)
     */
    const setTags = (tags: Record<string, any>) => {
        if (!isInitialized) return;
        OneSignal.User.addTags(tags);
    };

    return {
        isInitialized,
        permission,
        requestPermission,
        setTags,
    };
}
