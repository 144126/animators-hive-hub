
import React from 'react'
import { useUserAnimations } from '@/hooks/useUserAnimations'
import { AnimationCard } from './AnimationCard'
import { Video } from 'lucide-react'

export const UserAnimationsGrid = () => {
  const { data: animations, isLoading, error } = useUserAnimations()

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading animations...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load animations</p>
      </div>
    )
  }

  if (!animations || animations.length === 0) {
    return (
      <div className="text-center py-12">
        <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No animations yet</p>
        <p className="text-sm text-muted-foreground mt-2">
          Start sharing your work to see it here!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {animations.map((animation) => (
        <AnimationCard key={animation.id} animation={animation} />
      ))}
    </div>
  )
}
