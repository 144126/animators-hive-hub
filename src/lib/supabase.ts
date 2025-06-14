
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
