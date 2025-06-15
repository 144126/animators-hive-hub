
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, Edit } from 'lucide-react';

const Header = () => {
  const { user, signOut, loading } = useAuth();
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = user?.user_metadata?.username || user?.email?.split('@')[0] || 'User';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-auto flex items-center">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Animation</span>
          </Link>
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? "text-foreground" : "text-muted-foreground transition-colors hover:text-foreground"
              }
            >
              Discover
            </NavLink>
            <NavLink
              to="/communities"
              className={({ isActive }) =>
                isActive ? "text-foreground" : "text-muted-foreground transition-colors hover:text-foreground"
              }
            >
              Communities
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback>
                          {displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        View Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile/edit" className="flex items-center cursor-pointer">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => setAuthModalOpen(true)}>
                    Sign In
                  </Button>
                  <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
