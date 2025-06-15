
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Play, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { CommentsSection } from './CommentsSection'
import { useUpvoteAnimation } from '@/hooks/useUpvoteAnimation'
import { cn } from '@/lib/utils'

interface AnimationDetailViewProps {
  animation: {
    id: string
    title: string
    description: string | null
    video_url: string | null
    thumbnail_url: string | null
    upvote_count: number
    comment_count: number
    created_at: string
    author: {
      username: string
      avatar_url: string | null
      display_name: string | null
    }
    community: {
      name: string
      display_name: string
    } | null
  }
}

export const AnimationDetailView: React.FC<AnimationDetailViewProps> = ({ animation }) => {
  const navigate = useNavigate()
  const { hasUpvoted, toggleUpvote, isToggling } = useUpvoteAnimation(animation.id)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Video Player */}
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-black">
              {animation.video_url ? (
                <video
                  src={animation.video_url}
                  poster={animation.thumbnail_url || undefined}
                  controls
                  className="w-full h-full"
                >
                  Your browser does not support the video tag.
                </video>
              ) : animation.thumbnail_url ? (
                <div className="relative w-full h-full">
                  <img 
                    src={animation.thumbnail_url} 
                    alt={animation.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Play className="h-16 w-16 text-white drop-shadow-lg" />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Play className="h-16 w-16 text-primary/50" />
                </div>
              )}
            </div>
          </Card>

          {/* Animation Information */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{animation.title}</h1>
            
            {/* Author and Community Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={animation.author.avatar_url || undefined} />
                  <AvatarFallback>
                    {animation.author.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {animation.author.display_name || animation.author.username}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    @{animation.author.username}
                  </p>
                </div>
              </div>
              
              {animation.community && (
                <Badge variant="secondary">
                  {animation.community.display_name}
                </Badge>
              )}
            </div>

            {/* Stats and Actions */}
            <div className="flex items-center space-x-6">
              <Button
                variant={hasUpvoted ? "default" : "outline"}
                size="sm"
                onClick={toggleUpvote}
                disabled={isToggling}
                className={cn(
                  "flex items-center space-x-2",
                  hasUpvoted && "bg-orange-500 hover:bg-orange-600 border-orange-500"
                )}
              >
                <span>{animation.upvote_count}</span>
              </Button>
              <div className="flex items-center space-x-1 text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>{animation.comment_count} comments</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date(animation.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* Description */}
            {animation.description && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {animation.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Comments Section */}
          <CommentsSection postId={animation.id} />
        </div>
      </div>
    </div>
  )
}
