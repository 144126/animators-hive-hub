
import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';

const Header = () => {
  const { user, loading } = useAuth();
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-auto flex items-center">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Animotion</span>
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
                <Button asChild variant="ghost" size="sm">
                  <Link to="/profile">Profile</Link>
                </Button>
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
