
import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from '@/components/ui/use-toast'
import { Plus, Loader2 } from 'lucide-react'

interface AddToPlaylistModalProps {
  animationId: string
  animationTitle: string
}

export const AddToPlaylistModal = ({ animationId, animationTitle }: AddToPlaylistModalProps) => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)

  const { data: playlists, isLoading } = useQuery({
    queryKey: ['playlists', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('playlists')
        .select('id, name, description')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!user && isOpen
  })

  const addToPlaylistMutation = useMutation({
    mutationFn: async (playlistId: string) => {
      if (!user) throw new Error('You must be logged in')
      
      const { error } = await supabase
        .from('playlist_items')
        .insert({
          playlist_id: playlistId,
          post_id: animationId
        })
      
      if (error) throw error
    },
    onSuccess: (_, playlistId) => {
      const playlist = playlists?.find(p => p.id === playlistId)
      toast({ 
        title: 'Added to playlist!', 
        description: `"${animationTitle}" was added to "${playlist?.name}"` 
      })
      queryClient.invalidateQueries({ queryKey: ['playlist-items', playlistId] })
      setIsOpen(false)
    },
    onError: (error: any) => {
      if (error.message?.includes('duplicate key value')) {
        toast({ 
          title: 'Already in playlist', 
          description: 'This animation is already in that playlist',
          variant: 'destructive'
        })
      } else {
        toast({ 
          title: 'Failed to add to playlist', 
          description: error.message,
          variant: 'destructive'
        })
      }
    }
  })

  if (!user) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add to Playlist
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
          <DialogDescription>
            Choose a playlist to add "{animationTitle}" to
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : playlists && playlists.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {playlists.map((playlist) => (
              <Button
                key={playlist.id}
                variant="ghost"
                className="w-full justify-start h-auto p-4"
                onClick={() => addToPlaylistMutation.mutate(playlist.id)}
                disabled={addToPlaylistMutation.isPending}
              >
                <div className="text-left">
                  <div className="font-medium">{playlist.name}</div>
                  {playlist.description && (
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {playlist.description}
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">You don't have any playlists yet</p>
            <p className="text-sm text-muted-foreground">
              Create a playlist first to save animations
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
