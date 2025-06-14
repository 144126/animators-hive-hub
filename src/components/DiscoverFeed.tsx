
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { PostCard } from './PostCard'
import { Loader2 } from 'lucide-react'

type SortType = 'new' | 'top'

export const DiscoverFeed: React.FC = () => {
  const [sortBy, setSortBy] = useState<SortType>('new')

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['posts', sortBy],
    queryFn: async () => {
      console.log('Fetching posts with sort:', sortBy)
      
      let query = supabase
        .from('posts')
        .select(`
          id,
          title,
          thumbnail_url,
          video_url,
          upvote_count,
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

      // Sort by the selected option
      if (sortBy === 'new') {
        query = query.order('created_at', { ascending: false })
      } else {
        query = query.order('upvote_count', { ascending: false })
      }

      const { data, error } = await query.limit(20)

      if (error) {
        console.error('Error fetching posts:', error)
        throw error
      }

      console.log('Fetched posts:', data)
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

      {/* Posts Grid */}
      {!isLoading && posts && posts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && posts && posts.length === 0 && (
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
