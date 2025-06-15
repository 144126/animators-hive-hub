import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Plus, ListMusic } from 'lucide-react';
import { Link } from 'react-router-dom';

const playlistSchema = z.object({
  name: z.string().min(1, 'Playlist name is required').max(100),
  description: z.string().max(500).optional(),
});

type PlaylistFormValues = z.infer<typeof playlistSchema>;

interface Playlist {
  id: string;
  name: string;
  description: string | null;
}

const PlaylistsTab = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: playlists, isLoading } = useQuery({
    queryKey: ['playlists', user?.id],
    queryFn: async (): Promise<Playlist[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('playlists')
        .select('id, name, description')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast({ title: 'Error fetching playlists', description: error.message, variant: 'destructive' });
        throw error;
      }
      return data;
    },
    enabled: !!user,
  });

  const createPlaylistMutation = useMutation({
    mutationFn: async (values: PlaylistFormValues) => {
      if (!user) throw new Error('You must be logged in to create a playlist.');
      const { data, error } = await supabase
        .from('playlists')
        .insert({
          name: values.name,
          description: values.description || null,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Playlist created!', description: 'Your new playlist has been created.' });
      queryClient.invalidateQueries({ queryKey: ['playlists', user?.id] });
      setCreateDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({ title: 'Failed to create playlist', description: error.message, variant: 'destructive' });
    }
  });

  const form = useForm<PlaylistFormValues>({
    resolver: zodResolver(playlistSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = (values: PlaylistFormValues) => {
    createPlaylistMutation.mutate(values);
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Your Playlists</CardTitle>
          <CardDescription>Collections of animations you've saved</CardDescription>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new playlist</DialogTitle>
              <DialogDescription>Give your playlist a name and an optional description.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Epic Fights" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="A collection of the most epic fight scenes..." {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="ghost">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={createPlaylistMutation.isPending}>
                    {createPlaylistMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {playlists && playlists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map(playlist => (
              <Card key={playlist.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{playlist.name}</CardTitle>
                  <CardDescription className="line-clamp-3 h-[60px]">{playlist.description || 'No description.'}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/playlist/${playlist.id}`}>View Playlist</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ListMusic className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No playlists yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Create playlists to organize your favorite animations!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlaylistsTab;
