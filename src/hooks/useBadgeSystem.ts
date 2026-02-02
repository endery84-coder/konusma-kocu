import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { badges } from '@/lib/data/badges';

/**
 * Badge system hook for gamification.
 * Automatically checks and awards badges based on user achievements.
 * Shows toast notifications when new badges are earned.
 * 
 * @param {object} user - Current user object with stats (xp, streak, minutes)
 * @param {function} setUser - Function to update user state
 * @param {function} t - Translation function for localized messages
 * @example
 * ```tsx
 * useBadgeSystem(user, setUser, t);
 * // Badges are automatically checked and awarded based on user stats
 * ```
 */
export function useBadgeSystem(user: any, setUser: (u: any) => void, t: (key: string) => string) {
    const processingRef = useRef(false);

    useEffect(() => {
        if (!user || processingRef.current) return;

        const checkForNewBadges = async () => {
            const currentBadges = user.badges || [];
            const newBadges: { id: string; unlocked_at: string }[] = [];
            let hasChanges = false;

            badges.forEach(badge => {
                // Check if already unlocked
                if (currentBadges.some((b: any) => b.id === badge.id)) return;

                let earned = false;
                if (badge.requirement.type === 'xp' && (user.total_xp || 0) >= badge.requirement.value) earned = true;
                if (badge.requirement.type === 'streak' && (user.streak_days || 0) >= badge.requirement.value) earned = true;

                // Mock logic for minutes/words since we store total_practice_minutes but maybe not words
                if (badge.requirement.type === 'minutes' && (user.total_practice_minutes || 0) >= badge.requirement.value) earned = true;

                if (earned) {
                    newBadges.push({ id: badge.id, unlocked_at: new Date().toISOString() });
                    hasChanges = true;
                }
            });

            if (hasChanges) {
                processingRef.current = true;
                const updatedBadges = [...currentBadges, ...newBadges];

                const { error } = await supabase
                    .from('users')
                    .update({ badges: updatedBadges })
                    .eq('id', user.id);

                if (!error) {
                    setUser({ ...user, badges: updatedBadges });

                    newBadges.forEach(b => {
                        const badgeDef = badges.find(def => def.id === b.id);
                        // Using 'any' for t dynamic keys here as a pragmatic choice, assuming keys verify against translation files
                        toast.success(`${t('common.congrats')}!`, {
                            description: `${t(`profile.badges.${badgeDef?.key}.name` as any)} ${t('profile.badgeUnlocked')}`,
                            icon: badgeDef?.icon,
                            duration: 5000,
                        });
                    });
                }
                processingRef.current = false;
            }
        };

        checkForNewBadges();
    }, [user, setUser, t]);
}
