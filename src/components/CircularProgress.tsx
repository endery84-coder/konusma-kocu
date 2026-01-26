"use client"

import { motion } from "framer-motion"

interface CircularProgressProps {
    percentage: number
    size?: number
    strokeWidth?: number
    color?: string
}

export function CircularProgress({
    percentage,
    size = 120,
    strokeWidth = 10,
    color = "#6366F1", // Default primary
}: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            {/* Background Circle */}
            <svg width={size} height={size} className="rotate-[-90deg]">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-muted/20"
                />
                {/* Progress Circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - (percentage / 100) * circumference }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </svg>

            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center">
                {/* Can put children here if needed, or leave empty for overlay text */}
            </div>
        </div>
    )
}
