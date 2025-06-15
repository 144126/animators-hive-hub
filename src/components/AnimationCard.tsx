
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Video, MessageCircle, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { UpvoteButton } from './UpvoteButton'
import { AddToPlaylistModal } from './AddToPlaylistModal'

interface Animation {
  id: string
  title: string
  description?: string
  thumbnail_url?: string
  video_url?: string
  upvote_count: number
  comment_count: number
  created_at: string
  author: {
    username: string
    avatar_url?: string
  }
  community?: {
    name: string
    display_name: string
  }
}

interface AnimationCardProps {
  animation: Animation
}

export const AnimationCard = ({ animation }: AnimationCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/animation/${animation.id}`} className="block">
        <div className="aspect-video bg-muted relative overflow-hidden">
          {animation.thumbnail_url ? (
            <img 
              src={animation.thumbnail_url} 
              alt={animation.title} 
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Video className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
      </Link>
      
      <CardContent className="p-4">
        <Link to={`/animation/${animation.id}`}>
          <h3 className="font-semibold line-clamp-2 mb-2 hover:text-primary transition-colors">
            {animation.title}
          </h3>
        </Link>
        
        {animation.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {animation.description}
          </p>
        )}
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={animation.author.avatar_url} />
              <AvatarFallback className="text-xs">
                {animation.author.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {animation.author.username}
            </span>
          </div>
          
          {animation.community && (
            <Link 
              to={`/c/${animation.community.name}`}
              className="text-xs text-primary hover:underline"
            >
              {animation.community.display_name}
            </Link>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{animation.upvote_count}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{animation.comment_count}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <UpvoteButton 
              postId={animation.id} 
              upvoteCount={animation.upvote_count} 
            />
            <AddToPlaylistModal 
              animationId={animation.id} 
              animationTitle={animation.title}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
