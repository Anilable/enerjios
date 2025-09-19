'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileMenuButtonProps {
  isOpen: boolean
  onToggle: () => void
  className?: string
}

export function MobileMenuButton({ isOpen, onToggle, className }: MobileMenuButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleToggle = () => {
    setIsAnimating(true)
    onToggle()

    // Reset animation state after animation completes
    setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className={cn(
        "relative p-2 md:hidden touch-manipulation", // Added touch-manipulation for better mobile interaction
        "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
        "active:scale-95 transition-transform duration-150", // Touch feedback
        className
      )}
      aria-label={isOpen ? "Menüyü kapat" : "Menüyü aç"}
      aria-expanded={isOpen}
    >
      <div className="relative w-5 h-5">
        {/* Hamburger Lines */}
        <span
          className={cn(
            "absolute top-0 left-0 w-5 h-0.5 bg-current transform transition-all duration-300 ease-in-out",
            isOpen ? "rotate-45 translate-y-2" : "rotate-0 translate-y-0"
          )}
        />
        <span
          className={cn(
            "absolute top-2 left-0 w-5 h-0.5 bg-current transform transition-all duration-300 ease-in-out",
            isOpen ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
          )}
        />
        <span
          className={cn(
            "absolute top-4 left-0 w-5 h-0.5 bg-current transform transition-all duration-300 ease-in-out",
            isOpen ? "-rotate-45 -translate-y-2" : "rotate-0 translate-y-0"
          )}
        />
      </div>
    </Button>
  )
}