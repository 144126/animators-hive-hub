
import React from 'react'
import { LandingPage } from '@/components/LandingPage'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { LogOut, User, Video, Users, Heart, BookOpen } from 'lucide-react'

const Index = () => {
  const { user, signOut, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show landing page for logged-out users
  if (!user) {
    return <LandingPage />
  }

  // Show dashboard for logged-in users
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Video className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">The Home for Animators</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">Welcome back!</span>
            </div>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Welcome to Your Dashboard
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start exploring communities, sharing your work, and connecting with fellow animators.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="text-center p-6 rounded-lg border">
            <Video className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Share Your Work</h3>
            <p className="text-muted-foreground">
              Upload and showcase your animation projects to get feedback from the community.
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg border">
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Join Communities</h3>
            <p className="text-muted-foreground">
              Connect with like-minded animators in specialized communities.
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg border">
            <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Support Creators</h3>
            <p className="text-muted-foreground">
              Upvote amazing content and help talented animators get discovered.
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg border">
            <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Create Playlists</h3>
            <p className="text-muted-foreground">
              Organize your favorite animations into custom playlists.
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg border">
            <Video className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Learn & Grow</h3>
            <p className="text-muted-foreground">
              Discover tutorials, tips, and techniques from experienced animators.
            </p>
          </div>
          
          <div className="text-center p-6 rounded-lg border">
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Network</h3>
            <p className="text-muted-foreground">
              Build connections and collaborate with animators worldwide.
            </p>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-semibold mb-4">Ready to explore?</h3>
          <p className="text-muted-foreground mb-6">
            Start by browsing communities or sharing your first animation!
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg">Browse Communities</Button>
            <Button variant="outline" size="lg">Upload Animation</Button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Index
