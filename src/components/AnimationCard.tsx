
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, ArrowUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUpvoteAnimation } from '@/hooks/useUpvoteAnimation'
import { cn } from '@/lib/utils'

interface AnimationCardProps {
  animation: {
    id: string
    title: string
    thumbnail_url: string | null
    video_url: string | null
    author: {
      username: string
      avatar_url: string | null
    }
    community: {
      name: string
      display_name: string
    } | null
    upvote_count: number
    created_at: string
  }
}

export const AnimationCard: React.FC<AnimationCardProps> = ({ animation }) => {
  const navigate = useNavigate()
  const { hasUpvoted, toggleUpvote, isToggling } = useUpvoteAnimation(animation.id)

  const handleClick = () => {
    navigate(`/animation/${animation.id}`)
  }

  const handleUpvoteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    toggleUpvote()
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={handleClick}>
      <div className="relative aspect-video bg-muted">
        {animation.thumbnail_url ? (
          <img 
            src={animation.thumbnail_url} 
            alt={animation.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
            <Play className="h-12 w-12 text-primary/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
          <Play className="h-12 w-12 text-white drop-shadow-lg" />
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{animation.title}</h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={animation.author.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {animation.author.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{animation.author.username}</span>
          </div>
          
          {animation.community && (
            <Badge variant="secondary" className="text-xs">
              {animation.community.display_name}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUpvoteClick}
            disabled={isToggling}
            className={cn(
              "flex items-center space-x-1 text-sm",
              hasUpvoted && "text-orange-500"
            )}
          >
            <ArrowUp className={cn(
              "h-4 w-4",
              hasUpvoted && "fill-current"
            )} />
            <span>{animation.upvote_count}</span>
          </Button>
          <span className="text-sm text-muted-foreground">
            {new Date(animation.created_at).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
