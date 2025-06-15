
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { AnimationCard } from './AnimationCard'
import { Loader2 } from 'lucide-react'

type SortType = 'new' | 'top'

interface Animation {
  id: string
  title: string
  thumbnail_url: string | null
  video_url: string | null
  upvote_count: number
  comment_count: number
  created_at: string
  author: {
    username: string
    avatar_url: string | null
  }
  community: {
    name: string
    display_name: string
  } | null
}

export const DiscoverAnimationsFeed: React.FC<{ communityId?: string }> = ({ communityId }) => {
  const [sortBy, setSortBy] = useState<SortType>('new')

  const { data: animations, isLoading, error } = useQuery({
    queryKey: ['animations', sortBy, communityId],
    queryFn: async (): Promise<Animation[]> => {
      console.log('Fetching animations with sort:', sortBy, 'and communityId:', communityId)
      
      let query = supabase
        .from('animations')
        .select(`
          id,
          title,
          thumbnail_url,
          video_url,
          upvote_count,
          comment_count,
          created_at,
          author:users!author_id (
            username,
            avatar_url
          ),
          community:communities (
            name,
            display_name
          )
        `)

      if (communityId) {
        query = query.eq('community_id', communityId)
      }

      // Sort by the selected option
      if (sortBy === 'new') {
        query = query.order('created_at', { ascending: false })
      } else {
        query = query.order('upvote_count', { ascending: false })
      }

      const { data, error } = await query.limit(20)

      if (error) {
        console.error('Error fetching animations:', error)
        throw error
      }

      console.log('Fetched animations:', data)
      return data || []
    }
  })

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load animations</p>
        <p className="text-sm text-muted-foreground mt-2">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex space-x-2">
        <Button
          variant={sortBy === 'new' ? 'default' : 'outline'}
          onClick={() => setSortBy('new')}
        >
          New
        </Button>
        <Button
          variant={sortBy === 'top' ? 'default' : 'outline'}
          onClick={() => setSortBy('top')}
        >
          Top
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading animations...</p>
        </div>
      )}

      {/* Animations Grid */}
      {!isLoading && animations && animations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {animations.map((animation) => (
            <AnimationCard key={animation.id} animation={animation} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && animations && animations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No animations found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Be the first to share your work!
          </p>
        </div>
      )}
    </div>
  )
}
