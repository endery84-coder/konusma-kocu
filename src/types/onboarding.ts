
export type Goal =
    | 'fluency'          // Daha akıcı konuşmak
    | 'public_speaking'  // Topluluk önünde konuşma
    | 'reading'          // Okuma geliştirme
    | 'turkish_learning' // Türkçe öğrenme
    | 'child'            // Çocuk için
    | 'communication';   // Genel iletişim

export interface Challenge {
    id: string;
    label: string;
    icon: string;
    relatedGoals: Goal[];
}

// Her hedefe özel zorluklar
export const challengesByGoal: Record<Goal, Challenge[]> = {
    fluency: [
        { id: 'word_blocking', label: 'Kelimeler bazen takılıyor', icon: '🔤', relatedGoals: ['fluency'] },
        { id: 'repetition', label: 'Heceleri tekrarlıyorum', icon: '🔁', relatedGoals: ['fluency'] },
        { id: 'prolongation', label: 'Sesleri uzatıyorum', icon: '〰️', relatedGoals: ['fluency'] },
        { id: 'breathing_speech', label: 'Konuşurken nefesim yetmiyor', icon: '💨', relatedGoals: ['fluency'] },
        { id: 'fast_speech', label: 'Çok hızlı konuşuyorum', icon: '⚡', relatedGoals: ['fluency'] },
        { id: 'tension', label: 'Konuşurken gerginlik hissediyorum', icon: '😰', relatedGoals: ['fluency'] },
    ],

    public_speaking: [
        { id: 'stage_fear', label: 'Sahne korkusu yaşıyorum', icon: '🎭', relatedGoals: ['public_speaking'] },
        { id: 'anxiety', label: 'Topluluk önünde gerginleşiyorum', icon: '😓', relatedGoals: ['public_speaking'] },
        { id: 'eye_contact', label: 'Göz teması kurmakta zorlanıyorum', icon: '👁️', relatedGoals: ['public_speaking'] },
        { id: 'voice_shaking', label: 'Sesim titriyor', icon: '📢', relatedGoals: ['public_speaking'] },
        { id: 'forgetting', label: 'Ne söyleyeceğimi unutuyorum', icon: '🤔', relatedGoals: ['public_speaking'] },
        { id: 'filler_words', label: '"Şey", "yani" çok kullanıyorum', icon: '💬', relatedGoals: ['public_speaking'] },
    ],

    reading: [
        { id: 'slow_reading', label: 'Yavaş okuyorum', icon: '🐢', relatedGoals: ['reading'] },
        { id: 'comprehension', label: 'Okuduğumu anlamakta zorlanıyorum', icon: '🧠', relatedGoals: ['reading'] },
        { id: 'focus_reading', label: 'Okurken odaklanmakta zorlanıyorum', icon: '🎯', relatedGoals: ['reading'] },
        { id: 'skipping_words', label: 'Kelimeleri atlıyorum', icon: '⏭️', relatedGoals: ['reading'] },
        { id: 'line_tracking', label: 'Satır takibinde zorlanıyorum', icon: '📏', relatedGoals: ['reading'] },
        { id: 'loud_reading', label: 'Sesli okumakta zorlanıyorum', icon: '🔊', relatedGoals: ['reading'] },
    ],

    turkish_learning: [
        { id: 'pronunciation', label: 'Türkçe sesleri çıkarmakta zorlanıyorum', icon: '🗣️', relatedGoals: ['turkish_learning'] },
        { id: 'special_chars', label: 'Ş, Ç, Ğ, Ü, Ö sesleri zor', icon: '🔤', relatedGoals: ['turkish_learning'] },
        { id: 'intonation', label: 'Vurgu ve tonlama zor', icon: '📈', relatedGoals: ['turkish_learning'] },
        { id: 'vocabulary', label: 'Kelime bilgim sınırlı', icon: '📚', relatedGoals: ['turkish_learning'] },
        { id: 'grammar', label: 'Gramer kuralları karışıyor', icon: '📝', relatedGoals: ['turkish_learning'] },
        { id: 'listening', label: 'Dinlediğimi anlamakta zorlanıyorum', icon: '👂', relatedGoals: ['turkish_learning'] },
    ],

    child: [
        { id: 'late_speech', label: 'Konuşmaya geç başladı', icon: '🐣', relatedGoals: ['child'] },
        { id: 'unclear_speech', label: 'Konuşması anlaşılmıyor', icon: '❓', relatedGoals: ['child'] },
        { id: 'limited_words', label: 'Kelime dağarcığı sınırlı', icon: '📖', relatedGoals: ['child'] },
        { id: 'stuttering_child', label: 'Kekeleme belirtileri var', icon: '🔄', relatedGoals: ['child'] },
        { id: 'shy_speaking', label: 'Konuşmaktan çekiniyor', icon: '🙈', relatedGoals: ['child'] },
        { id: 'attention', label: 'Dikkat süresi kısa', icon: '⏱️', relatedGoals: ['child'] },
    ],

    communication: [
        { id: 'expressing', label: 'Kendimi ifade etmekte zorlanıyorum', icon: '💭', relatedGoals: ['communication'] },
        { id: 'confidence', label: 'Konuşurken özgüvenim düşük', icon: '😔', relatedGoals: ['communication'] },
        { id: 'social', label: 'Sosyal ortamlarda konuşamıyorum', icon: '👥', relatedGoals: ['communication'] },
        { id: 'phone_calls', label: 'Telefonda konuşmaktan çekiniyorum', icon: '📱', relatedGoals: ['communication'] },
        { id: 'meetings', label: 'Toplantılarda söz almaktan kaçınıyorum', icon: '🏢', relatedGoals: ['communication'] },
        { id: 'strangers', label: 'Yabancılarla konuşmak zor', icon: '🤝', relatedGoals: ['communication'] },
    ],
};
