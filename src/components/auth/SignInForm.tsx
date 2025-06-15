
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { GoogleIcon } from '@/components/GoogleIcon'

interface SignInFormProps {
  onToggleMode: () => void
}

export const SignInForm: React.FC<SignInFormProps> = ({ onToggleMode }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signIn, loading, signInWithGoogle } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signIn(email, password)
    } catch (error) {
      // Error is handled in the auth context
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" className="w-full" onClick={() => signInWithGoogle()} disabled={loading}>
        <GoogleIcon className="mr-2 h-4 w-4" />
        Sign In with Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={onToggleMode}
          className="text-sm text-primary hover:underline"
          disabled={loading}
        >
          Don't have an account? Sign up
        </button>
      </div>
    </div>
  )
}
