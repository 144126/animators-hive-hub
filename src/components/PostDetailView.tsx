
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Play, MessageCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { CommentsSection } from './CommentsSection'
import { UpvoteButton } from './UpvoteButton'

interface PostDetailViewProps {
  post: {
    id: string
    title: string
    content: string | null
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

export const PostDetailView: React.FC<PostDetailViewProps> = ({ post }) => {
  const navigate = useNavigate()

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
              {post.video_url ? (
                <video
                  src={post.video_url}
                  poster={post.thumbnail_url || undefined}
                  controls
                  className="w-full h-full"
                >
                  Your browser does not support the video tag.
                </video>
              ) : post.thumbnail_url ? (
                <div className="relative w-full h-full">
                  <img 
                    src={post.thumbnail_url} 
                    alt={post.title}
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

          {/* Post Information */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{post.title}</h1>
            
            {/* Author and Community Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.author.avatar_url || undefined} />
                  <AvatarFallback>
                    {post.author.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {post.author.display_name || post.author.username}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    @{post.author.username}
                  </p>
                </div>
              </div>
              
              {post.community && (
                <Badge variant="secondary">
                  {post.community.display_name}
                </Badge>
              )}
            </div>

            {/* Stats and Actions */}
            <div className="flex items-center space-x-6">
              <UpvoteButton 
                postId={post.id} 
                upvoteCount={post.upvote_count}
              />
              <div className="flex items-center space-x-1 text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>{post.comment_count} comments</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date(post.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* Description */}
            {post.content && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {post.content}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Comments Section */}
          <CommentsSection postId={post.id} />
        </div>
      </div>
    </div>
  )
}
