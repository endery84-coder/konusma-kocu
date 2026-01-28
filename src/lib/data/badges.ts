export interface Badge {
    id: string;
    key: string; // for i18n
    icon: string;
    color: string;
    requirement: {
        type: 'streak' | 'xp' | 'minutes' | 'words';
        value: number;
    };
}

export const badges: Badge[] = [
    {
        id: 'start',
        key: 'start',
        icon: '🌱',
        color: 'bg-green-100 text-green-600',
        requirement: { type: 'xp', value: 1 }
    },
    {
        id: 'week_streak',
        key: 'week_streak',
        icon: '🔥',
        color: 'bg-orange-100 text-orange-600',
        requirement: { type: 'streak', value: 7 }
    },
    {
        id: 'early_bird',
        key: 'early_bird',
        icon: '🌅',
        color: 'bg-blue-100 text-blue-600',
        requirement: { type: 'minutes', value: 60 } // Mock: Practice in morning
    },
    {
        id: 'scholar',
        key: 'scholar',
        icon: '📚',
        color: 'bg-purple-100 text-purple-600',
        requirement: { type: 'words', value: 100 }
    },
    {
        id: 'master',
        key: 'master',
        icon: '👑',
        color: 'bg-yellow-100 text-yellow-600',
        requirement: { type: 'xp', value: 1000 }
    }
];
