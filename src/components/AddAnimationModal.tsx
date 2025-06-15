
import React, { useState } from 'react'
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
import { Plus, Upload } from 'lucide-react'
import { CommunityCombobox } from './CommunityCombobox'
import { FileUploadSection } from './FileUploadSection'
import { useAnimationUpload } from '@/hooks/useAnimationUpload'

export const AddAnimationModal = () => {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [communityId, setCommunityId] = useState<string>('')
  const [newCommunityName, setNewCommunityName] = useState('')
  const { user } = useAuth()
  const { createAnimationMutation, isUploading } = useAnimationUpload()

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setVideoFile(null)
    setThumbnailFile(null)
    setCommunityId('')
    setNewCommunityName('')
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

    if (communityId === 'create-new' && !newCommunityName.trim()) {
      toast.error('Please enter a community name')
      return
    }

    createAnimationMutation.mutate({
      title,
      description,
      videoFile,
      thumbnailFile,
      communityId,
      newCommunityName
    }, {
      onSuccess: () => {
        setOpen(false)
        resetForm()
      }
    })
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a valid video file')
        return
      }
      
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
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image file size must be less than 5MB')
        return
      }
      
      setThumbnailFile(file)
    }
  }

  const handleCommunityChange = (value: string) => {
    setCommunityId(value)
    if (value !== 'create-new') {
      setNewCommunityName('')
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

          <FileUploadSection
            videoFile={videoFile}
            thumbnailFile={thumbnailFile}
            onVideoChange={handleVideoChange}
            onThumbnailChange={handleThumbnailChange}
            onVideoRemove={() => setVideoFile(null)}
            onThumbnailRemove={() => setThumbnailFile(null)}
            disabled={isUploading}
          />

          <div className="space-y-2">
            <Label htmlFor="community">Community (Optional)</Label>
            <CommunityCombobox
              value={communityId}
              onValueChange={handleCommunityChange}
              disabled={isUploading}
            />
          </div>

          {communityId === 'create-new' && (
            <div className="space-y-2">
              <Label htmlFor="new-community-name">New Community Name *</Label>
              <Input
                id="new-community-name"
                value={newCommunityName}
                onChange={(e) => setNewCommunityName(e.target.value)}
                placeholder="Enter community name"
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground">
                The community will be created and your animation will be added to it
              </p>
            </div>
          )}

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
