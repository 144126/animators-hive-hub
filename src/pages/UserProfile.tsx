
import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Video, Edit } from 'lucide-react'
import { Link } from 'react-router-dom'
import PlaylistsTab from '@/components/PlaylistsTab'
import { AddAnimationModal } from '@/components/AddAnimationModal'

const UserProfile = () => {
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please sign in to view your profile.</p>
          <Link to="/">
            <Button>Go to Homepage</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Get user's display name from metadata or use username/email
  const displayName = user.user_metadata?.username || user.email?.split('@')[0] || 'User'
  const bio = user.user_metadata?.bio || 'No bio available yet.'

  return (
    <div className="min-h-screen bg-background">
      {/* Profile Content */}
      <main className="container mx-auto px-4 py-8">
        {/* User Info Section */}
        <div className="flex items-start space-x-6 mb-8">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback className="text-2xl">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
                <p className="text-muted-foreground text-lg mb-4">{bio}</p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>Member since {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <Link to="/profile/edit">
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="animations" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="animations">Animations</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
          </TabsList>
          
          <TabsContent value="animations" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Animations</CardTitle>
                  <CardDescription>
                    Animations you've shared with the community
                  </CardDescription>
                </div>
                <AddAnimationModal />
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No animations yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start sharing your work to see it here!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="playlists" className="mt-6">
            <PlaylistsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default UserProfile
