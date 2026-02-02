"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface UsePremiumReturn {
    isPremium: boolean;
    plan: string | null;
    expiresAt: Date | null;
    loading: boolean;
    checkPremium: () => Promise<void>;
}

export function usePremium(): UsePremiumReturn {
    const [isPremium, setIsPremium] = useState(false);
    const [plan, setPlan] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<Date | null>(null);
    const [loading, setLoading] = useState(true);

    const checkPremium = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setIsPremium(false);
                return;
            }

            const { data: profile } = await supabase
                .from('users')
                .select('is_premium, premium_plan, premium_expires_at')
                .eq('id', user.id)
                .single();

            if (profile) {
                // Check if premium is still valid
                const isValid = profile.is_premium &&
                    (!profile.premium_expires_at || new Date(profile.premium_expires_at) > new Date());

                setIsPremium(isValid);
                setPlan(profile.premium_plan);
                setExpiresAt(profile.premium_expires_at ? new Date(profile.premium_expires_at) : null);
            }
        } catch {
            // Premium check error handled silently
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkPremium();
    }, []);

    return { isPremium, plan, expiresAt, loading, checkPremium };
}
