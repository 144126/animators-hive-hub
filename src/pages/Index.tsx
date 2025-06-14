
import React from 'react'
import { LandingPage } from '@/components/LandingPage'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { LogOut, User, Video } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DiscoverFeed } from '@/components/DiscoverFeed'

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
      {/* Header with Navigation */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Video className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">The Home for Animators</h1>
          </div>
          
          {/* Main Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Button variant="ghost" className="text-base font-medium">
              Discover
            </Button>
            <Button variant="ghost" className="text-base font-medium">
              Communities
            </Button>
          </nav>
          
          {/* User Profile Section */}
          <div className="flex items-center space-x-4">
            <Link to="/profile">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Discover</h2>
          <p className="text-muted-foreground">
            Explore amazing animations from our community
          </p>
        </div>

        <DiscoverFeed />
      </main>
    </div>
  )
}

export default Index
