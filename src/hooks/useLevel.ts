"use client";

import { useMemo } from 'react';

/**
 * Level thresholds - XP required to reach each level
 * Formula: level^2 * 100 (makes leveling progressively harder)
 */
const LEVEL_THRESHOLDS = [
    0,      // Level 1: 0 XP
    100,    // Level 2: 100 XP
    400,    // Level 3: 400 XP
    900,    // Level 4: 900 XP
    1600,   // Level 5: 1,600 XP
    2500,   // Level 6: 2,500 XP
    3600,   // Level 7: 3,600 XP
    4900,   // Level 8: 4,900 XP
    6400,   // Level 9: 6,400 XP
    8100,   // Level 10: 8,100 XP (MAX)
];

const LEVEL_TITLES: Record<number, { tr: string; en: string; de: string }> = {
    1: { tr: 'Başlangıç', en: 'Beginner', de: 'Anfänger' },
    2: { tr: 'Çaylak', en: 'Novice', de: 'Neuling' },
    3: { tr: 'Çırak', en: 'Apprentice', de: 'Lehrling' },
    4: { tr: 'Gelişen', en: 'Developing', de: 'Entwickelnd' },
    5: { tr: 'Yetkin', en: 'Competent', de: 'Kompetent' },
    6: { tr: 'Deneyimli', en: 'Experienced', de: 'Erfahren' },
    7: { tr: 'Uzman', en: 'Expert', de: 'Experte' },
    8: { tr: 'Usta', en: 'Master', de: 'Meister' },
    9: { tr: 'Grandmaster', en: 'Grandmaster', de: 'Großmeister' },
    10: { tr: 'Efsane', en: 'Legend', de: 'Legende' },
};

const LEVEL_COLORS: Record<number, string> = {
    1: 'from-slate-400 to-slate-500',
    2: 'from-green-400 to-emerald-500',
    3: 'from-blue-400 to-cyan-500',
    4: 'from-indigo-400 to-blue-500',
    5: 'from-purple-400 to-indigo-500',
    6: 'from-pink-400 to-purple-500',
    7: 'from-orange-400 to-amber-500',
    8: 'from-red-400 to-rose-500',
    9: 'from-amber-400 to-yellow-500',
    10: 'from-yellow-300 via-amber-400 to-orange-500',
};

const LEVEL_ICONS: Record<number, string> = {
    1: '🌱',
    2: '🌿',
    3: '🌳',
    4: '⭐',
    5: '🌟',
    6: '💫',
    7: '🏆',
    8: '👑',
    9: '💎',
    10: '🔥',
};

interface LevelInfo {
    level: number;
    currentXP: number;
    xpForCurrentLevel: number;
    xpForNextLevel: number;
    progressToNextLevel: number; // 0-100 percentage
    xpNeededForNext: number;
    isMaxLevel: boolean;
    title: { tr: string; en: string; de: string };
    color: string;
    icon: string;
}

/**
 * Calculate level information from total XP
 */
export function calculateLevel(totalXP: number): LevelInfo {
    let level = 1;

    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (totalXP >= LEVEL_THRESHOLDS[i]) {
            level = i + 1;
            break;
        }
    }

    const isMaxLevel = level >= LEVEL_THRESHOLDS.length;
    const xpForCurrentLevel = LEVEL_THRESHOLDS[level - 1] || 0;
    const xpForNextLevel = isMaxLevel
        ? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
        : LEVEL_THRESHOLDS[level] || 10000;

    const xpIntoCurrentLevel = totalXP - xpForCurrentLevel;
    const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
    const progressToNextLevel = isMaxLevel
        ? 100
        : Math.min(100, (xpIntoCurrentLevel / xpNeededForLevel) * 100);

    return {
        level,
        currentXP: totalXP,
        xpForCurrentLevel,
        xpForNextLevel,
        progressToNextLevel,
        xpNeededForNext: isMaxLevel ? 0 : xpForNextLevel - totalXP,
        isMaxLevel,
        title: LEVEL_TITLES[level] || LEVEL_TITLES[1],
        color: LEVEL_COLORS[level] || LEVEL_COLORS[1],
        icon: LEVEL_ICONS[level] || '🌱',
    };
}

/**
 * Hook to use level information with memoization
 */
export function useLevel(totalXP: number): LevelInfo {
    return useMemo(() => calculateLevel(totalXP), [totalXP]);
}

/**
 * Get all level thresholds for displaying level progression
 */
export function getAllLevels() {
    return LEVEL_THRESHOLDS.map((xp, index) => ({
        level: index + 1,
        xpRequired: xp,
        title: LEVEL_TITLES[index + 1],
        color: LEVEL_COLORS[index + 1],
        icon: LEVEL_ICONS[index + 1],
    }));
}
