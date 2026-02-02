"use client";

import { useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';

/**
 * Hook for triggering confetti celebrations.
 * Uses canvas-confetti library for performant animations.
 * 
 * @returns {{ fireConfetti: function, fireStars: function, fireEmoji: function }}
 * @example
 * ```tsx
 * const { fireConfetti, fireStars } = useConfetti();
 * 
 * const handleComplete = () => {
 *   fireConfetti();
 * };
 * ```
 */
export function useConfetti() {
    /**
     * Fire a burst of colorful confetti from both sides of the screen
     */
    const fireConfetti = useCallback(() => {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 },
            zIndex: 9999,
        };

        function fire(particleRatio: number, opts: confetti.Options) {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio),
            });
        }

        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        });

        fire(0.2, {
            spread: 60,
        });

        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8,
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2,
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    }, []);

    /**
     * Fire golden stars celebration (for achievements)
     */
    const fireStars = useCallback(() => {
        const defaults = {
            spread: 360,
            ticks: 100,
            gravity: 0,
            decay: 0.94,
            startVelocity: 30,
            colors: ['#FFD700', '#FFA500', '#FF6347'],
            shapes: ['star'] as confetti.Shape[],
            zIndex: 9999,
        };

        function shoot() {
            confetti({
                ...defaults,
                particleCount: 40,
                scalar: 1.2,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            });
            confetti({
                ...defaults,
                particleCount: 40,
                scalar: 1.5,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            });
        }

        setTimeout(shoot, 0);
        setTimeout(shoot, 200);
        setTimeout(shoot, 400);
    }, []);

    /**
     * Fire emoji celebration
     */
    const fireEmoji = useCallback((emoji: string = '🎉') => {
        const scalar = 2;
        const unicorn = confetti.shapeFromText({ text: emoji, scalar });

        const defaults = {
            spread: 360,
            ticks: 60,
            gravity: 0.5,
            decay: 0.96,
            startVelocity: 20,
            shapes: [unicorn],
            scalar,
            zIndex: 9999,
        };

        confetti({
            ...defaults,
            particleCount: 30,
            origin: { x: 0.5, y: 0.5 },
        });
    }, []);

    return { fireConfetti, fireStars, fireEmoji };
}

function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
}
