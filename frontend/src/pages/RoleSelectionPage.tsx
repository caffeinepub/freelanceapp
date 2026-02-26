import { useState, useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useChooseRole } from '../hooks/useQueries';
import { AppRole } from '../backend';
import { Button } from '@/components/ui/button';
import { Briefcase, Code2, CheckCircle2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function RoleSelectionPage() {
  const { identity } = useInternetIdentity();
  const router = useRouter();
  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();
  const chooseRole = useChooseRole();
  // Always start with null — never pre-populate from any cached/stored state
  const [selectedRole, setSelectedRole] = useState<'customer' | 'freelancer' | null>(null);
  const isAuthenticated = !!identity;

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthenticated) {
      router.navigate({ to: '/login' });
    }
  }, [isAuthenticated, router]);

  // Redirect users who already have a role to their dashboard
  useEffect(() => {
    if (!isFetched) return;
    if (userProfile !== null && userProfile !== undefined) {
      if (userProfile.appRole === AppRole.customer) {
        router.navigate({ to: '/customer-dashboard' });
      } else {
        router.navigate({ to: '/freelancer-dashboard' });
      }
    }
  }, [userProfile, isFetched, router]);

  const handleContinue = async () => {
    if (!selectedRole) return;
    try {
      await chooseRole.mutateAsync(selectedRole === 'freelancer');
      toast.success(`Welcome! You're set up as a ${selectedRole}.`);
      if (selectedRole === 'customer') {
        router.navigate({ to: '/customer-dashboard' });
      } else {
        router.navigate({ to: '/freelancer-dashboard' });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to set role';
      toast.error(message);
    }
  };

  // Show loading spinner while:
  // 1. Profile is still loading
  // 2. Profile is fetched and already has a role (redirect is in progress)
  const isRedirecting = isFetched && userProfile !== null && userProfile !== undefined;
  if (isLoading || isRedirecting) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {isRedirecting ? 'Redirecting to your dashboard...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Only render the role selection UI when we've confirmed the user has no role yet
  if (!isFetched) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Hero Banner */}
      <div className="relative h-48 overflow-hidden">
        <img
          src="/assets/generated/hero-banner.dim_1200x400.png"
          alt="FreeLaunch"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">Welcome to FreeLaunch</h1>
            <p className="text-white/80">Choose how you want to use the platform</p>
          </div>
        </div>
      </div>

      {/* Role Selection */}
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">I want to...</h2>
          <p className="text-muted-foreground">Select your role to get started. You can always create a new account for the other role.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {/* Customer Card */}
          <button
            onClick={() => setSelectedRole('customer')}
            className={`relative group rounded-2xl border-2 p-8 text-left transition-all duration-200 cursor-pointer ${
              selectedRole === 'customer'
                ? 'border-primary bg-primary/5 shadow-card-hover'
                : 'border-border bg-card hover:border-primary/50 hover:shadow-card'
            }`}
          >
            {selectedRole === 'customer' && (
              <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-primary" />
            )}
            <div className="mb-5">
              <img
                src="/assets/generated/customer-role-icon.dim_256x256.png"
                alt="Customer"
                className="w-20 h-20 rounded-xl object-cover mb-4"
              />
              <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1 mb-3">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">Customer / Client</span>
              </div>
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">Hire Freelancers</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Post jobs, review proposals from talented freelancers, and get your projects done efficiently.
            </p>
            <ul className="mt-4 space-y-1.5">
              {['Post job listings', 'Review proposals', 'Hire top talent'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </button>

          {/* Freelancer Card */}
          <button
            onClick={() => setSelectedRole('freelancer')}
            className={`relative group rounded-2xl border-2 p-8 text-left transition-all duration-200 cursor-pointer ${
              selectedRole === 'freelancer'
                ? 'border-secondary bg-secondary/5 shadow-card-hover'
                : 'border-border bg-card hover:border-secondary/50 hover:shadow-card'
            }`}
          >
            {selectedRole === 'freelancer' && (
              <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-secondary" />
            )}
            <div className="mb-5">
              <img
                src="/assets/generated/freelancer-role-icon.dim_256x256.png"
                alt="Freelancer"
                className="w-20 h-20 rounded-xl object-cover mb-4"
              />
              <div className="inline-flex items-center gap-2 bg-secondary/10 rounded-full px-3 py-1 mb-3">
                <Code2 className="h-3.5 w-3.5 text-secondary" />
                <span className="text-xs font-semibold text-secondary">Freelancer / Professional</span>
              </div>
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">Find Work</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Browse open jobs, submit proposals, showcase your skills, and build your freelance career.
            </p>
            <ul className="mt-4 space-y-1.5">
              {['Browse job listings', 'Submit proposals', 'Manage your work'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-secondary flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </button>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedRole || chooseRole.isPending}
            size="lg"
            className="px-10 py-6 text-base font-semibold rounded-xl gap-2"
          >
            {chooseRole.isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                Continue as {selectedRole ? (selectedRole === 'customer' ? 'Customer' : 'Freelancer') : '...'}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
