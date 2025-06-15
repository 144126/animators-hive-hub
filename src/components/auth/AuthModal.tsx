
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
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

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">
            {mode === 'signin' ? 'Welcome back' : 'Create an account'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {mode === 'signin' ? 'Sign in to your account' : 'Join the animator community'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="pt-4">
          {mode === 'signin' ? (
            <SignInForm onToggleMode={toggleMode} />
          ) : (
            <SignUpForm onToggleMode={toggleMode} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
