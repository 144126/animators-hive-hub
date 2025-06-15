
import React, { useState, useRef } from 'react'
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
import { Plus, Upload, Video, Image as ImageIcon, X } from 'lucide-react'

interface Community {
  id: string
  name: string
  display_name: string
}

export const AddAnimationModal = () => {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [communityId, setCommunityId] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

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

  // Function to generate thumbnail from video
  const generateThumbnailFromVideo = (videoFile: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        video.currentTime = 1 // Capture frame at 1 second
      }
      
      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          canvas.toBlob((blob) => {
            if (blob) {
              const thumbnailFile = new File([blob], `${videoFile.name}-thumbnail.jpg`, { type: 'image/jpeg' })
              resolve(thumbnailFile)
            } else {
              reject(new Error('Failed to generate thumbnail'))
            }
          }, 'image/jpeg', 0.8)
        }
      }
      
      video.onerror = () => reject(new Error('Failed to load video'))
      video.src = URL.createObjectURL(videoFile)
      video.load()
    })
  }

  // Function to upload file to storage
  const uploadFile = async (file: File, bucket: string, folder: string): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${user!.id}/${Date.now()}.${fileExt}`
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file)
    
    if (error) throw error
    
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)
    
    return data.publicUrl
  }

  const createAnimationMutation = useMutation({
    mutationFn: async (animationData: {
      title: string
      description: string | null
      video_url: string | null
      thumbnail_url: string | null
      community_id: string | null
      author_id: string
    }) => {
      setIsUploading(true)
      
      let videoUrl = null
      let thumbnailUrl = null
      
      try {
        // Upload video file if provided
        if (videoFile) {
          videoUrl = await uploadFile(videoFile, 'animation-videos', 'videos')
          
          // Generate and upload thumbnail if no custom thumbnail provided
          if (!thumbnailFile) {
            try {
              const generatedThumbnail = await generateThumbnailFromVideo(videoFile)
              thumbnailUrl = await uploadFile(generatedThumbnail, 'animation-thumbnails', 'thumbnails')
            } catch (error) {
              console.warn('Failed to generate thumbnail:', error)
              // Continue without thumbnail if generation fails
            }
          }
        }
        
        // Upload custom thumbnail if provided
        if (thumbnailFile) {
          thumbnailUrl = await uploadFile(thumbnailFile, 'animation-thumbnails', 'thumbnails')
        }
        
        // Create animation record
        const { data, error } = await supabase
          .from('animations')
          .insert({
            ...animationData,
            video_url: videoUrl,
            thumbnail_url: thumbnailUrl
          })
          .select()
          .single()

        if (error) throw error
        return data
      } finally {
        setIsUploading(false)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animations'] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Animation uploaded successfully!')
      setOpen(false)
      resetForm()
    },
    onError: (error) => {
      console.error('Error creating animation:', error)
      toast.error('Failed to upload animation')
      setIsUploading(false)
    }
  })

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setVideoFile(null)
    setThumbnailFile(null)
    setCommunityId('')
    if (videoInputRef.current) videoInputRef.current.value = ''
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = ''
  }

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

    if (!videoFile) {
      toast.error('Please select a video file')
      return
    }

    createAnimationMutation.mutate({
      title: title.trim(),
      description: description.trim() || null,
      video_url: null, // Will be set during upload
      thumbnail_url: null, // Will be set during upload
      community_id: communityId === 'none' ? null : communityId || null,
      author_id: user.id
    })
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a valid video file')
        return
      }
      
      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Video file size must be less than 50MB')
        return
      }
      
      setVideoFile(file)
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image file size must be less than 5MB')
        return
      }
      
      setThumbnailFile(file)
    }
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
              disabled={isUploading}
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
              disabled={isUploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-file">Video File *</Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => videoInputRef.current?.click()}
                disabled={isUploading}
                className="flex-1"
              >
                <Video className="h-4 w-4 mr-2" />
                {videoFile ? videoFile.name : 'Select Video File'}
              </Button>
              {videoFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setVideoFile(null)
                    if (videoInputRef.current) videoInputRef.current.value = ''
                  }}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="hidden"
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: MP4, MOV, AVI, etc. Max size: 50MB
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail-file">Custom Thumbnail (Optional)</Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => thumbnailInputRef.current?.click()}
                disabled={isUploading}
                className="flex-1"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                {thumbnailFile ? thumbnailFile.name : 'Select Thumbnail Image'}
              </Button>
              {thumbnailFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setThumbnailFile(null)
                    if (thumbnailInputRef.current) thumbnailInputRef.current.value = ''
                  }}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="hidden"
              disabled={isUploading}
            />
            <p className="text-xs text-muted-foreground">
              If not provided, a thumbnail will be auto-generated from the video. Max size: 5MB
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="community">Community (Optional)</Label>
            <Select value={communityId} onValueChange={setCommunityId} disabled={isUploading}>
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
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading || createAnimationMutation.isPending}>
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload Animation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
