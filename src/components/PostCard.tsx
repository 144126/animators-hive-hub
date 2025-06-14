
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface PostCardProps {
  post: {
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

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/post/${post.id}`)
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={handleClick}>
      <div className="relative aspect-video bg-muted">
        {post.thumbnail_url ? (
          <img 
            src={post.thumbnail_url} 
            alt={post.title}
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
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={post.author.avatar_url || undefined} />
              <AvatarFallback className="text-xs">
                {post.author.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{post.author.username}</span>
          </div>
          
          {post.community && (
            <Badge variant="secondary" className="text-xs">
              {post.community.display_name}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
          <span>{post.upvote_count} upvotes</span>
          <span>{new Date(post.created_at).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}
