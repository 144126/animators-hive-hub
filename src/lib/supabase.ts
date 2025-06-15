import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yuewubncxzqopejwmqrf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1ZXd1Ym5jeHpxb3BlandtcXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5Mjk5MDgsImV4cCI6MjA2NTUwNTkwOH0.47pIaebL9U74KxC92jqwNKlTvIBrXcu--aw5Uwl0owg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          display_name: string | null
          bio: string | null
          avatar_url: string | null
          website_url: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          website_url?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          bio?: string | null
          avatar_url?: string | null
          website_url?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      communities: {
        Row: {
          id: string
          name: string
          display_name: string
          description: string | null
          avatar_url: string | null
          banner_url: string | null
          creator_id: string
          member_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          description?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          creator_id: string
          member_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          description?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          creator_id?: string
          member_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          content: string | null
          video_url: string | null
          thumbnail_url: string | null
          author_id: string
          community_id: string | null
          upvote_count: number
          comment_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content?: string | null
          video_url?: string | null
          thumbnail_url?: string | null
          author_id: string
          community_id?: string | null
          upvote_count?: number
          comment_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string | null
          video_url?: string | null
          thumbnail_url?: string | null
          author_id?: string
          community_id?: string | null
          upvote_count?: number
          comment_count?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
