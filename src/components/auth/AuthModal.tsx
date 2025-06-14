
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { SignInForm } from './SignInForm'
import { SignUpForm } from './SignUpForm'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'signin' | 'signup'
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  initialMode = 'signin' 
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {/* Header content is handled by the forms */}
        </DialogHeader>
        
        {mode === 'signin' ? (
          <SignInForm onToggleMode={toggleMode} />
        ) : (
          <SignUpForm onToggleMode={toggleMode} />
        )}
      </DialogContent>
    </Dialog>
  )
}
