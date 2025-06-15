
import React, { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Video, Image as ImageIcon, X } from 'lucide-react'

interface FileUploadSectionProps {
  videoFile: File | null
  thumbnailFile: File | null
  onVideoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onThumbnailChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onVideoRemove: () => void
  onThumbnailRemove: () => void
  disabled: boolean
}

export const FileUploadSection = ({
  videoFile,
  thumbnailFile,
  onVideoChange,
  onThumbnailChange,
  onVideoRemove,
  onThumbnailRemove,
  disabled
}: FileUploadSectionProps) => {
  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="video-file">Video File *</Label>
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => videoInputRef.current?.click()}
            disabled={disabled}
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
              onClick={onVideoRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={onVideoChange}
          className="hidden"
          disabled={disabled}
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
            disabled={disabled}
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
              onClick={onThumbnailRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <input
          ref={thumbnailInputRef}
          type="file"
          accept="image/*"
          onChange={onThumbnailChange}
          className="hidden"
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          If not provided, a thumbnail will be auto-generated from the video. Max size: 5MB
        </p>
      </div>
    </>
  )
}
