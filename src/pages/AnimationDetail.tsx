
import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { AnimationDetailView } from '@/components/AnimationDetailView'

const AnimationDetail = () => {
  const { animationId } = useParams<{ animationId: string }>()

  const { data: animation, isLoading, error } = useQuery({
    queryKey: ['animation', animationId],
    queryFn: async () => {
      if (!animationId) throw new Error('Animation ID is required')
      
      const { data, error } = await supabase
        .from('animations')
        .select(`
          id,
          title,
          description,
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
        .eq('id', animationId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!animationId,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading animation...</p>
        </div>
      </div>
    )
  }

  if (error || !animation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Animation not found</p>
        </div>
      </div>
    )
  }

  return <AnimationDetailView animation={animation} />
}

export default AnimationDetail
