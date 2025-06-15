
import React from 'react'
import { LandingPage } from '@/components/LandingPage'
import { useAuth } from '@/contexts/AuthContext'
import { DiscoverFeed } from '@/components/DiscoverFeed'

const Index = () => {
  const { user, loading } = useAuth()

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
