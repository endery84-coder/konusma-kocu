/**
 * Speech analysis utilities for evaluating speaking fluency.
 * Calculates metrics like WPM, filler word usage, and provides AI-style feedback.
 */

export interface SpeechAnalysisResult {
    wordCount: number;
    durationSeconds: number;
    wpm: number;
    fillerCount: number;
    fillersFound: string[];
    score: number;
    feedback: string;
    detailedFeedback: DetailedFeedback;
}

export interface DetailedFeedback {
    speedAssessment: 'too_slow' | 'optimal' | 'too_fast';
    fillerAssessment: 'excellent' | 'good' | 'needs_work';
    lengthAssessment: 'too_short' | 'adequate' | 'good';
    tips: string[];
}

/**
 * Filler words by language.
 * These are common hesitation sounds and verbal crutches.
 */
const FILLER_WORDS: Record<string, string[]> = {
    tr: ['eee', 'ııı', 'şey', 'hani', 'yani', 'falan', 'filan', 'işte', 'aslında', 'mesela'],
    en: ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally', 'right', 'so yeah'],
    de: ['ähm', 'halt', 'quasi', 'sozusagen', 'eigentlich', 'also'],
    es: ['eh', 'este', 'bueno', 'o sea', 'pues', 'entonces'],
    fr: ['euh', 'ben', 'genre', 'en fait', 'donc', 'voilà'],
    it: ['ehm', 'cioè', 'tipo', 'praticamente', 'allora'],
    ru: ['эм', 'ну', 'как бы', 'типа', 'вот'],
    ar: ['يعني', 'اه'],
    fa: ['یعنی', 'اوم', 'خب'],
};

/**
 * Feedback messages by language and score range.
 */
const FEEDBACK_MESSAGES: Record<string, Record<string, string>> = {
    tr: {
        excellent: "Mükemmel! Harika bir akıcılık ve hız gösterdin. 🌟",
        good: "Gayet iyi! Biraz daha az duraksama ile mükemmel olursun. 👍",
        average: "Orta seviye. Akıcılığı artırmak için günlük pratik önerilir. 💪",
        needsWork: "Geliştirilmesi gereken alanlar var. Endişelenme, pratik yapmaya devam et! 🎯",
    },
    en: {
        excellent: "Excellent! You demonstrated great fluency and pacing. 🌟",
        good: "Good job! Reduce hesitations slightly to achieve perfection. 👍",
        average: "Average level. Daily practice is recommended to improve fluency. 💪",
        needsWork: "There are areas to improve. Don't worry, keep practicing! 🎯",
    },
    de: {
        excellent: "Ausgezeichnet! Du hast großartige Flüssigkeit gezeigt. 🌟",
        good: "Gut gemacht! Reduziere Zögern leicht für Perfektion. 👍",
        average: "Durchschnittlich. Tägliches Üben wird empfohlen. 💪",
        needsWork: "Es gibt Bereiche zu verbessern. Übe weiter! 🎯",
    },
};

/**
 * Tips by language based on specific issues.
 */
const TIPS: Record<string, Record<string, string>> = {
    tr: {
        slowDown: "Biraz yavaşlamayı dene, her kelimeyi net söyle.",
        speedUp: "Konuşma hızını biraz artırabilirsin.",
        reduceFiller: "\"Şey\", \"yani\" gibi dolgu kelimeleri azaltmaya çalış.",
        practiceMore: "Günde 5 dakika sesli okuma pratiği yap.",
        breathe: "Cümleler arasında nefes almayı unutma.",
        goodJob: "Harika gidiyorsun, bu tempoyu koru!",
    },
    en: {
        slowDown: "Try to slow down a bit, articulate each word clearly.",
        speedUp: "You can increase your speaking pace slightly.",
        reduceFiller: "Try to reduce filler words like \"um\", \"like\".",
        practiceMore: "Practice reading aloud for 5 minutes daily.",
        breathe: "Remember to breathe between sentences.",
        goodJob: "Great work, keep up this pace!",
    },
    de: {
        slowDown: "Versuche etwas langsamer zu sprechen.",
        speedUp: "Du kannst dein Sprechtempo leicht erhöhen.",
        reduceFiller: "Versuche Füllwörter wie \"ähm\" zu reduzieren.",
        practiceMore: "Übe täglich 5 Minuten laut zu lesen.",
        breathe: "Vergiss nicht zwischen den Sätzen zu atmen.",
        goodJob: "Großartige Arbeit, mach weiter so!",
    },
};

/**
 * Analyzes speech transcript and provides detailed feedback.
 * 
 * @param transcript - The text transcript of the speech
 * @param durationSeconds - Total speaking duration in seconds
 * @param lang - Language code (tr, en, de, etc.)
 * @returns SpeechAnalysisResult with score, metrics, and feedback
 */
export function analyzeSpeech(
    transcript: string,
    durationSeconds: number,
    lang: string = 'tr'
): SpeechAnalysisResult {
    const words = transcript.toLowerCase().trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    // Calculate WPM
    const minutes = durationSeconds / 60;
    const wpm = minutes > 0 ? Math.round(wordCount / minutes) : 0;

    // Detect Fillers
    const currentFillers = FILLER_WORDS[lang] || FILLER_WORDS['en'];
    const fillersFound = words.filter(word => currentFillers.includes(word));
    const fillerCount = fillersFound.length;

    // Calculate Score
    let baseScore = 100;

    // Filler Penalty: -5 per filler (max -40)
    const fillerPenalty = Math.min(fillerCount * 5, 40);
    baseScore -= fillerPenalty;

    // Speed Assessment & Penalty
    let speedAssessment: DetailedFeedback['speedAssessment'] = 'optimal';
    let speedPenalty = 0;

    if (wpm < 80) {
        speedPenalty = 15;
        speedAssessment = 'too_slow';
    } else if (wpm > 180) {
        speedPenalty = 15;
        speedAssessment = 'too_fast';
    } else if (wpm < 100 || wpm > 160) {
        speedPenalty = 5; // Slightly outside optimal
    }
    baseScore -= speedPenalty;

    // Length Penalty (too short)
    let lengthAssessment: DetailedFeedback['lengthAssessment'] = 'good';
    if (wordCount < 10) {
        baseScore -= 30;
        lengthAssessment = 'too_short';
    } else if (wordCount < 30) {
        baseScore -= 10;
        lengthAssessment = 'adequate';
    }

    // Filler Assessment
    let fillerAssessment: DetailedFeedback['fillerAssessment'] = 'excellent';
    if (fillerCount >= 5) {
        fillerAssessment = 'needs_work';
    } else if (fillerCount >= 2) {
        fillerAssessment = 'good';
    }

    // Clamp score 0-100
    const finalScore = Math.max(0, Math.min(100, baseScore));

    // Generate Feedback
    const feedbackLang = FEEDBACK_MESSAGES[lang] || FEEDBACK_MESSAGES['en'];
    const tipsLang = TIPS[lang] || TIPS['en'];

    let feedback: string;
    if (finalScore >= 90) {
        feedback = feedbackLang.excellent;
    } else if (finalScore >= 70) {
        feedback = feedbackLang.good;
    } else if (finalScore >= 50) {
        feedback = feedbackLang.average;
    } else {
        feedback = feedbackLang.needsWork;
    }

    // Generate Tips
    const tips: string[] = [];
    if (speedAssessment === 'too_slow') tips.push(tipsLang.speedUp);
    if (speedAssessment === 'too_fast') tips.push(tipsLang.slowDown);
    if (fillerAssessment === 'needs_work') tips.push(tipsLang.reduceFiller);
    if (lengthAssessment === 'too_short') tips.push(tipsLang.practiceMore);
    if (fillerAssessment === 'excellent' && speedAssessment === 'optimal') tips.push(tipsLang.goodJob);
    if (tips.length === 0) tips.push(tipsLang.breathe);

    return {
        wordCount,
        durationSeconds,
        wpm,
        fillerCount,
        fillersFound,
        score: finalScore,
        feedback,
        detailedFeedback: {
            speedAssessment,
            fillerAssessment,
            lengthAssessment,
            tips,
        },
    };
}
