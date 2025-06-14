
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export const useUpvote = (postId: string) => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  // Check if user has upvoted this post
  const { data: hasUpvoted, isLoading } = useQuery({
    queryKey: ['upvote', postId, user?.id],
    queryFn: async () => {
      if (!user) return false
      
      const { data, error } = await supabase
        .from('upvotes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking upvote:', error)
        return false
      }
      
      return !!data
    },
    enabled: !!user && !!postId
  })

  // Add upvote mutation
  const addUpvoteMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in to upvote')
      
      const { error } = await supabase
        .from('upvotes')
        .insert({
          user_id: user.id,
          post_id: postId
        })
      
      if (error) throw error
    },
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['upvote', postId, user?.id] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      toast.success('Post upvoted!')
    },
    onError: (error) => {
      console.error('Error adding upvote:', error)
      toast.error('Failed to upvote post')
    }
  })

  // Remove upvote mutation
  const removeUpvoteMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in to remove upvote')
      
      const { error } = await supabase
        .from('upvotes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
      
      if (error) throw error
    },
    onSuccess: () => {
      // Invalidate relevant queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['upvote', postId, user?.id] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
      toast.success('Upvote removed')
    },
    onError: (error) => {
      console.error('Error removing upvote:', error)
      toast.error('Failed to remove upvote')
    }
  })

  const toggleUpvote = () => {
    if (!user) {
      toast.error('Please sign in to upvote posts')
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
