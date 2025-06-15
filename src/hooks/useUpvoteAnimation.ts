
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export const useUpvoteAnimation = (animationId: string) => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  // Check if user has upvoted this animation
  const { data: hasUpvoted, isLoading } = useQuery({
    queryKey: ['upvote-animation', animationId, user?.id],
    queryFn: async () => {
      if (!user) return false
      
      const { data, error } = await supabase
        .from('upvotes')
        .select('id')
        .eq('animation_id', animationId)
        .eq('user_id', user.id)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking upvote:', error)
        return false
      }
      
      return !!data
    },
    enabled: !!user && !!animationId
  })

  // Add upvote mutation
  const addUpvoteMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in to upvote')
      
      const { error } = await supabase
        .from('upvotes')
        .insert({
          user_id: user.id,
          animation_id: animationId
        })
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upvote-animation', animationId, user?.id] })
      queryClient.invalidateQueries({ queryKey: ['animations'] })
      queryClient.invalidateQueries({ queryKey: ['animation', animationId] })
      toast.success('Animation upvoted!')
    },
    onError: (error) => {
      console.error('Error adding upvote:', error)
      toast.error('Failed to upvote animation')
    }
  })

  // Remove upvote mutation
  const removeUpvoteMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in to remove upvote')
      
      const { error } = await supabase
        .from('upvotes')
        .delete()
        .eq('animation_id', animationId)
        .eq('user_id', user.id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upvote-animation', animationId, user?.id] })
      queryClient.invalidateQueries({ queryKey: ['animations'] })
      queryClient.invalidateQueries({ queryKey: ['animation', animationId] })
      toast.success('Upvote removed')
    },
    onError: (error) => {
      console.error('Error removing upvote:', error)
      toast.error('Failed to remove upvote')
    }
  })

  const toggleUpvote = () => {
    if (!user) {
      toast.error('Please sign in to upvote animations')
      return
    }

    if (hasUpvoted) {
      removeUpvoteMutation.mutate()
    } else {
      addUpvoteMutation.mutate()
    }
  }

  return {
    hasUpvoted: hasUpvoted || false,
    isLoading,
    toggleUpvote,
    isToggling: addUpvoteMutation.isPending || removeUpvoteMutation.isPending
  }
}
