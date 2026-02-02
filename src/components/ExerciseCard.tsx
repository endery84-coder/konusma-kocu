import { Play, Lock, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button" // unused
import { motion } from "framer-motion"

interface ExerciseCardProps {
    title: string
    description: string
    duration: string
    difficulty: number // 1-4
    isLocked?: boolean
    icon?: React.ReactNode
    color?: string
    onClick?: () => void
    index?: number // For staggered animation
}

export function ExerciseCard({
    title,
    description,
    duration,
    difficulty,
    isLocked = false,
    icon,
    color = "bg-primary/10 text-primary",
    onClick,
    index = 0,
}: ExerciseCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={isLocked ? undefined : onClick}
            className={cn(
                "group relative flex items-center space-x-4 rounded-2xl border bg-card p-4 shadow-sm transition-all hover:shadow-md cursor-pointer",
                isLocked ? "opacity-75 cursor-not-allowed" : "hover:border-primary/50"
            )}
        >
            {/* Icon Box */}
            <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", color)}>
                {icon}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>

                <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {duration}
                    </div>
                    <div className="flex items-center space-x-0.5">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-1.5 w-1.5 rounded-full",
                                    i <= difficulty ? "bg-accent" : "bg-muted"
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Action / Lock */}
            <div className="shrink-0">
                {isLocked ? (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Lock className="h-4 w-4" />
                    </div>
                ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        <Play className="h-4 w-4 fill-current" />
                    </div>
                )}
            </div>
        </motion.div>
    )
}
