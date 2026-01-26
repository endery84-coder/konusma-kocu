import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Quote {
    id: string;
    quote: string;
    author: string | null;
    category: string;
}

export function useDailyQuote(userGoals: string[]) {
    const [quote, setQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuote = async () => {
            if (!userGoals.length) {
                setLoading(false);
                return;
            }

            // Bugünün tarihini seed olarak kullan (her gün aynı söz)
            const today = new Date().toISOString().split('T')[0];
            const seed = today.split('-').join('');

            const { data, error } = await supabase
                .from('daily_quotes')
                .select('*')
                .overlaps('target_goals', userGoals);

            if (data && data.length > 0) {
                // Deterministic random selection based on date
                const index = parseInt(seed) % data.length;
                setQuote(data[index]);
            }

            setLoading(false);
        };

        fetchQuote();
    }, [userGoals]);

    return { quote, loading };
}
