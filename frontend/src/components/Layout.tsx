import React from 'react';
import { useRouter } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { AppRole } from '../backend';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Briefcase, User, LogOut, Settings, LayoutDashboard, ChevronDown } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: userProfile } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    router.navigate({ to: '/login' });
  };

  const handleDashboard = () => {
    if (!userProfile) return;
    if (userProfile.appRole === AppRole.customer) {
      router.navigate({ to: '/customer-dashboard' });
    } else {
      router.navigate({ to: '/freelancer-dashboard' });
    }
  };

  const displayName = userProfile?.displayName || 'User';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const isCustomer = userProfile?.appRole === AppRole.customer;
  const isFreelancer = userProfile?.appRole === AppRole.freelancer;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-xs">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => {
              if (isAuthenticated && userProfile) {
                handleDashboard();
              } else {
                router.navigate({ to: '/' });
              }
            }}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <img
              src="/assets/generated/freelaunch-logo.dim_256x256.png"
              alt="FreeLaunch"
              className="h-8 w-8 rounded-lg object-cover"
            />
            <span className="font-display font-bold text-xl text-foreground">
              Free<span className="text-primary">Launch</span>
            </span>
          </button>

          {/* Nav */}
          <nav className="flex items-center gap-3">
            {isAuthenticated && userProfile && (
              <>
                {isCustomer && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.navigate({ to: '/customer-dashboard' })}
                    className="hidden sm:flex gap-1.5"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                )}
                {isFreelancer && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.navigate({ to: '/freelancer-dashboard' })}
                      className="hidden sm:flex gap-1.5"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.navigate({ to: '/profile/edit' })}
                      className="hidden sm:flex gap-1.5"
                    >
                      <User className="h-4 w-4" />
                      My Profile
                    </Button>
                  </>
                )}
              </>
            )}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-accent transition-colors">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden sm:block max-w-[120px] truncate">
                      {displayName}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {userProfile && (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">
                      {isCustomer ? '👔 Customer' : '💼 Freelancer'}
                    </div>
                  )}
                  <DropdownMenuSeparator />
                  {isFreelancer && (
                    <DropdownMenuItem onClick={() => router.navigate({ to: '/profile/edit' })}>
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={login}
                disabled={isLoggingIn}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoggingIn ? 'Connecting...' : 'Login'}
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6 mt-auto">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            <span>© {new Date().getFullYear()} FreeLaunch. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-1">
            Built with{' '}
            <span className="text-destructive mx-1">♥</span>
            {' '}using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'freelaunch-app')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
