
import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { PostDetailView } from '@/components/PostDetailView'
import { Loader2 } from 'lucide-react'

interface PostDetailData {
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

const PostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>()

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', postId],
    queryFn: async (): Promise<PostDetailData> => {
      console.log('Fetching post details for:', postId)
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          content,
          video_url,
          thumbnail_url,
          upvote_count,
          comment_count,
          created_at,
          author:users!author_id (
            username,
            avatar_url,
            display_name
          ),
          community:communities (
            name,
            display_name
          )
        `)
        .eq('id', postId!)
        .single()

      if (error) {
        console.error('Error fetching post:', error)
        throw error
      }

      console.log('Fetched post:', data)
      return data
    },
    enabled: !!postId
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading animation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load animation</p>
          <p className="text-sm text-muted-foreground mt-2">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Animation not found</p>
        </div>
      </div>
    )
  }

  return <PostDetailView post={post} />
}

export default PostDetail
