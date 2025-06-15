
import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { DiscoverFeed } from '@/components/DiscoverFeed'
import { Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const CommunityPage = () => {
  const { communityName } = useParams<{ communityName: string }>()

  const { data: community, isLoading: isLoadingCommunity } = useQuery({
    queryKey: ['community', communityName],
    queryFn: async () => {
      if (!communityName) return null
      const { data, error } = await supabase
        .from('communities')
        .select('id, display_name, description, avatar_url, banner_url')
        .eq('name', communityName)
        .single()
      
      if (error) {
        console.error('Error fetching community:', error)
        return null;
      }
      return data
    },
    enabled: !!communityName,
  })

  if (isLoadingCommunity) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!community) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Community not found.</p>
      </div>
    )
  }

  return (
    <div>
      {community.banner_url && (
        <div className="h-32 md:h-48 bg-cover bg-center" style={{ backgroundImage: `url(${community.banner_url})` }} />
      )}
      <div className="container mx-auto p-4 sm:p-6">
        <div className="flex items-end -mt-12 md:-mt-16 mb-6">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background bg-background">
            <AvatarImage src={community.avatar_url || undefined} />
            <AvatarFallback className="text-4xl">{community.display_name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold">{community.display_name}</h1>
            <p className="text-sm md:text-base text-muted-foreground">{community.description}</p>
          </div>
        </div>
        
        <DiscoverFeed communityId={community.id} />
      </div>
    </div>
  )
}

export default CommunityPage
