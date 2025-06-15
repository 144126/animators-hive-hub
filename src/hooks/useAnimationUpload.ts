
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export const useAnimationUpload = () => {
  const [isUploading, setIsUploading] = useState(false)
  const { user } = useAuth()
  const queryClient = useQueryClient()

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

  // Function to create a new community
  const createCommunity = async (name: string): Promise<string> => {
    const communityName = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    
    const { data, error } = await supabase
      .from('communities')
      .insert({
        name: communityName,
        display_name: name,
        creator_id: user!.id
      })
      .select()
      .single()

    if (error) throw error
    return data.id
  }

  const createAnimationMutation = useMutation({
    mutationFn: async ({
      title,
      description,
      videoFile,
      thumbnailFile,
      communityId,
      newCommunityName
    }: {
      title: string
      description: string | null
      videoFile: File | null
      thumbnailFile: File | null
      communityId: string
      newCommunityName: string
    }) => {
      setIsUploading(true)
      
      let videoUrl = null
      let thumbnailUrl = null
      let finalCommunityId = communityId === 'none' ? null : communityId
      
      try {
        // Create new community if needed
        if (communityId === 'create-new' && newCommunityName.trim()) {
          finalCommunityId = await createCommunity(newCommunityName.trim())
        }

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
            title: title.trim(),
            description: description?.trim() || null,
            video_url: videoUrl,
            thumbnail_url: thumbnailUrl,
            community_id: finalCommunityId,
            author_id: user!.id
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
      queryClient.invalidateQueries({ queryKey: ['communities'] })
      toast.success('Animation uploaded successfully!')
    },
    onError: (error) => {
      console.error('Error creating animation:', error)
      toast.error('Failed to upload animation')
      setIsUploading(false)
    }
  })

  return {
    createAnimationMutation,
    isUploading
  }
}
