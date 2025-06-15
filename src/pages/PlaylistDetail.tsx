
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ListMusic, Video } from 'lucide-react';

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  created_at: string;
}

const PlaylistDetail = () => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const { user } = useAuth();

  const { data: playlist, isLoading, error } = useQuery({
    queryKey: ['playlist', playlistId],
    queryFn: async (): Promise<Playlist> => {
      if (!playlistId) throw new Error('Playlist ID is required');
      
      const { data, error } = await supabase
        .from('playlists')
        .select('id, name, description, user_id, created_at')
        .eq('id', playlistId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!playlistId,
  });

  const { data: playlistItems, isLoading: itemsLoading } = useQuery({
    queryKey: ['playlist-items', playlistId],
    queryFn: async () => {
      if (!playlistId) return [];
      
      const { data, error } = await supabase
        .from('playlist_items')
        .select(`
          id,
          post_id,
          posts:post_id (
            id,
            title,
            thumbnail_url,
            video_url,
            author_id,
            users:author_id (
              username,
              display_name
            )
          )
        `)
        .eq('playlist_id', playlistId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!playlistId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading playlist...</p>
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Playlist not found.</p>
          <Link to="/profile">
            <Button>Back to Profile</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Check if current user owns this playlist
  const isOwner = user?.id === playlist.user_id;

  return (
    <div className="min-h-screen bg-background">
      {/* Playlist Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <div className="flex items-center space-x-4 mb-8">
          <Link to="/profile">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <ListMusic className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Playlist</h1>
          </div>
        </div>

        {/* Playlist Info */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{playlist.name}</h1>
          {playlist.description && (
            <p className="text-lg text-muted-foreground mb-4">{playlist.description}</p>
          )}
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Created {new Date(playlist.created_at).toLocaleDateString()}</span>
            <span>•</span>
            <span>{playlistItems?.length || 0} animations</span>
          </div>
        </div>

        {/* Playlist Items */}
        <Card>
          <CardHeader>
            <CardTitle>Animations</CardTitle>
            <CardDescription>
              {isOwner ? 'Your saved animations' : 'Animations in this playlist'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {itemsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : playlistItems && playlistItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {playlistItems.map((item: any) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {item.posts?.thumbnail_url ? (
                        <img 
                          src={item.posts.thumbnail_url} 
                          alt={item.posts?.title || 'Animation'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-2 mb-2">
                        {item.posts?.title || 'Untitled Animation'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        by {item.posts?.users?.display_name || item.posts?.users?.username || 'Unknown'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ListMusic className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No animations in this playlist yet</p>
                {isOwner && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Add animations to your playlist to see them here!
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PlaylistDetail;
