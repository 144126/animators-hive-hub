
import React from 'react'
import { Button } from '@/components/ui/button'
import { ArrowUp } from 'lucide-react'
import { useUpvote } from '@/hooks/useUpvote'
import { cn } from '@/lib/utils'

interface UpvoteButtonProps {
  postId: string
  upvoteCount: number
  variant?: 'default' | 'minimal'
  className?: string
}

export const UpvoteButton: React.FC<UpvoteButtonProps> = ({ 
  postId, 
  upvoteCount, 
  variant = 'default',
  className 
}) => {
  const { hasUpvoted, toggleUpvote, isToggling } = useUpvote(postId)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering parent click handlers
    toggleUpvote()
  }

  if (variant === 'minimal') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={isToggling}
        className={cn(
          "flex items-center space-x-1 text-sm",
          hasUpvoted && "text-orange-500",
          className
        )}
      >
        <ArrowUp className={cn(
          "h-4 w-4",
          hasUpvoted && "fill-current"
        )} />
        <span>{upvoteCount}</span>
      </Button>
    )
  }

  return (
    <Button
      variant={hasUpvoted ? "default" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={isToggling}
      className={cn(
        "flex items-center space-x-2",
        hasUpvoted && "bg-orange-500 hover:bg-orange-600 border-orange-500",
        className
      )}
    >
      <ArrowUp className={cn(
        "h-4 w-4",
        hasUpvoted && "fill-current"
      )} />
      <span>{upvoteCount}</span>
    </Button>
  )
}
