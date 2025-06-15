
import React, { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Upload } from 'lucide-react'

interface Community {
  id: string
  name: string
  display_name: string
}

export const AddAnimationModal = () => {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [communityId, setCommunityId] = useState<string>('')
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch communities for selection
  const { data: communities } = useQuery({
    queryKey: ['communities'],
    queryFn: async (): Promise<Community[]> => {
      const { data, error } = await supabase
        .from('communities')
        .select('id, name, display_name')
        .order('display_name')

      if (error) throw error
      return data || []
    }
  })

  const createAnimationMutation = useMutation({
    mutationFn: async (animationData: {
      title: string
      description: string | null
      video_url: string | null
      thumbnail_url: string | null
      community_id: string | null
      author_id: string
    }) => {
      const { data, error } = await supabase
        .from('animations')
        .insert(animationData)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animations'] })
      queryClient.invalidateQueries({ queryKey: ['posts'] }) // Also invalidate posts for compatibility
      toast.success('Animation uploaded successfully!')
      setOpen(false)
      // Reset form
      setTitle('')
      setDescription('')
      setVideoUrl('')
      setThumbnailUrl('')
      setCommunityId('')
    },
    onError: (error) => {
      console.error('Error creating animation:', error)
      toast.error('Failed to upload animation')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('You must be logged in to upload animations')
      return
    }

    if (!title.trim()) {
      toast.error('Title is required')
      return
    }

    createAnimationMutation.mutate({
      title: title.trim(),
      description: description.trim() || null,
      video_url: videoUrl.trim() || null,
      thumbnail_url: thumbnailUrl.trim() || null,
      community_id: communityId === 'none' ? null : communityId || null,
      author_id: user.id
    })
  }

  if (!user) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Animation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload New Animation</DialogTitle>
          <DialogDescription>
            Share your animation with the community
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter animation title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your animation..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-url">Video URL</Label>
            <Input
              id="video-url"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://example.com/video.mp4"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail-url">Thumbnail URL</Label>
            <Input
              id="thumbnail-url"
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://example.com/thumbnail.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="community">Community (Optional)</Label>
            <Select value={communityId} onValueChange={setCommunityId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a community" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No community</SelectItem>
                {communities?.map((community) => (
                  <SelectItem key={community.id} value={community.id}>
                    {community.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createAnimationMutation.isPending}>
              <Upload className="h-4 w-4 mr-2" />
              {createAnimationMutation.isPending ? 'Uploading...' : 'Upload Animation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
