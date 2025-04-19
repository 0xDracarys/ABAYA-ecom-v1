import { cn } from "@/lib/utils"

interface SpinnerProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function Spinner({ className, size = "md" }: SpinnerProps) {
  const sizeClass = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
  }[size]

  return (
    <div 
      className={cn(
        "animate-spin rounded-full border-t-transparent", 
        sizeClass,
        className
      )}
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
} 