export interface SpeechAnalysisResult {
    wordCount: number;
    durationSeconds: number;
    wpm: number;
    fillerCount: number;
    fillersFound: string[];
    score: number;
    feedback: string;
}

const FILLER_WORDS: Record<string, string[]> = {
    tr: ['eee', 'ııı', 'şey', 'hani', 'yani', 'falan', 'filan', 'işte'],
    en: ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally'],
    de: ['ähm', 'halt', 'quasi', 'sozusagen'],
    es: ['eh', 'este', 'bueno', 'o sea'],
    fr: ['euh', 'ben', 'genre', 'en fait'],
};

export function analyzeSpeech(transcript: string, durationSeconds: number, lang: string = 'tr'): SpeechAnalysisResult {
    const words = transcript.toLowerCase().trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    // Calculate WPM
    // If duration is 0, avoid division by zero
    const minutes = durationSeconds / 60;
    const wpm = minutes > 0 ? Math.round(wordCount / minutes) : 0;

    // Detect Fillers
    const currentFillers = FILLER_WORDS[lang] || FILLER_WORDS['en']; // Fallback to EN
    const fillersFound = words.filter(word => currentFillers.includes(word));
    const fillerCount = fillersFound.length;

    // Calculate Score (Simple Algorithm)
    // Dedect points for fillers and inappropriate speed
    let baseScore = 100;

    // Filler Penalty: -5 per filler (max -40)
    const fillerPenalty = Math.min(fillerCount * 5, 40);
    baseScore -= fillerPenalty;

    // Speed Penalty
    // Ideal WPM: 100-150 for speaking
    let speedPenalty = 0;
    if (wpm < 80) speedPenalty = 20; // Too slow
    if (wpm > 180) speedPenalty = 20; // Too fast
    baseScore -= speedPenalty;

    // Length Penalty (too short)
    if (wordCount < 10) baseScore -= 30;

    // Clamp score 0-100
    const finalScore = Math.max(0, Math.min(100, baseScore));

    // Generate Feedback
    let feedback = "";
    if (finalScore >= 90) feedback = "Mükemmel! Harika bir akıcılık ve hız.";
    else if (finalScore >= 70) feedback = "Gayet iyi. Biraz daha az duraksamaya çalış.";
    else if (finalScore >= 50) feedback = "Orta seviye. Akıcılığı artırmak için pratik yapmalı.";
    else feedback = "Geliştirilmesi gerek. Daha fazla pratikle düzeltebilirsin.";

    // Translate feedback roughly (mock implementation - normally use keys)
    if (lang !== 'tr') {
        if (finalScore >= 90) feedback = "Excellent! Great fluency and pace.";
        else if (finalScore >= 70) feedback = "Good job. Try to reduce pauses.";
        else feedback = "Keep practicing to improve fluency.";
    }

    return {
        wordCount,
        durationSeconds,
        wpm,
        fillerCount,
        fillersFound,
        score: finalScore,
        feedback
    };
}
