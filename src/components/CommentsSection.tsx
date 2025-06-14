
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageCircle, Send } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

interface Comment {
  id: string
  content: string
  created_at: string
  author: {
    username: string
    avatar_url: string | null
    display_name: string | null
  }
}

interface CommentsSectionProps {
  postId: string
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ postId }) => {
  const [newComment, setNewComment] = useState('')
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async (): Promise<Comment[]> => {
      console.log('Fetching comments for post:', postId)
      
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          author:users!author_id (
            username,
            avatar_url,
            display_name
          )
        `)
        .eq('post_id', postId)
        .is('parent_id', null)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching comments:', error)
        throw error
      }

      console.log('Fetched comments:', data)
      return data || []
    }
  })

  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) {
        throw new Error('You must be logged in to comment')
      }

      console.log('Creating comment:', { content, postId, userId: user.id })

      const { data, error } = await supabase
        .from('comments')
        .insert({
          content,
          post_id: postId,
          author_id: user.id
        })
        .select(`
          id,
          content,
          created_at,
          author:users!author_id (
            username,
            avatar_url,
            display_name
          )
        `)
        .single()

      if (error) {
        console.error('Error creating comment:', error)
        throw error
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      setNewComment('')
      toast.success('Comment posted!')
    },
    onError: (error) => {
      console.error('Failed to post comment:', error)
      toast.error('Failed to post comment')
    }
  })

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    
    createCommentMutation.mutate(newComment.trim())
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5" />
          <span>Comments ({comments?.length || 0})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comment Form */}
        {user ? (
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!newComment.trim() || createCommentMutation.isPending}
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                {createCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            Please log in to leave a comment
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-6 text-muted-foreground">
              Loading comments...
            </div>
          ) : comments && comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="border-l-2 border-muted pl-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={comment.author.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {comment.author.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">
                    {comment.author.display_name || comment.author.username}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm pl-8">{comment.content}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
