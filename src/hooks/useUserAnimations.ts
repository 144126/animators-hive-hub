
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export const useUserAnimations = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['user-animations', user?.id],
    queryFn: async () => {
      if (!user) return []

      const { data, error } = await supabase
        .from('animations')
        .select(`
          *,
          author:users!animations_author_id_fkey(username, avatar_url),
          community:communities(name, display_name)
        `)
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!user
  })
}
