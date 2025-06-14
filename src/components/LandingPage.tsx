
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AuthModal } from '@/components/auth/AuthModal'
import { Video } from 'lucide-react'

export const LandingPage = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false)

  const openSignUp = () => {
    setAuthModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Video className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">The Home for Animators</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            The Home for Animators
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Showcase your work, connect with peers, and get the feedback you need to grow
          </p>
          
          <Button 
            size="lg" 
            onClick={openSignUp}
            className="text-lg px-8 py-4 h-auto"
          >
            Sign Up Now
          </Button>
        </div>
      </main>

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        initialMode="signup"
      />
    </div>
  )
}
