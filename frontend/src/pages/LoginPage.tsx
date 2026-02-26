import { useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { AppRole } from '../backend';
import { Button } from '@/components/ui/button';
import { Briefcase, Zap, Shield, Star } from 'lucide-react';

export default function LoginPage() {
  const { identity, login, loginStatus, isInitializing } = useInternetIdentity();
  const router = useRouter();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  useEffect(() => {
    if (!isAuthenticated || profileLoading || !isFetched) return;

    if (userProfile === null || userProfile === undefined) {
      router.navigate({ to: '/role-selection' });
    } else if (userProfile.appRole === AppRole.customer) {
      router.navigate({ to: '/customer-dashboard' });
    } else {
      router.navigate({ to: '/freelancer-dashboard' });
    }
  }, [isAuthenticated, userProfile, profileLoading, isFetched, router]);

  const features = [
    { icon: Briefcase, title: 'Post & Find Jobs', desc: 'Connect customers with skilled freelancers' },
    { icon: Zap, title: 'Fast Hiring', desc: 'Review proposals and hire in minutes' },
    { icon: Shield, title: 'Secure & Decentralized', desc: 'Built on the Internet Computer' },
    { icon: Star, title: 'Quality Work', desc: 'Talented professionals at your fingertips' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/assets/generated/hero-banner.dim_1200x400.png"
            alt="FreeLaunch Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/60" />
        </div>
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary-foreground rounded-full px-4 py-1.5 text-sm font-medium mb-6 backdrop-blur-sm">
            <Zap className="h-3.5 w-3.5" />
            The Decentralized Freelance Platform
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Where Talent Meets
            <br />
            <span className="text-primary">Opportunity</span>
          </h1>
          <p className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
            Post jobs, find skilled freelancers, and get work done — all on a secure, decentralized platform.
          </p>
          <Button
            onClick={login}
            disabled={isLoggingIn || isInitializing}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-10 py-6 text-lg rounded-xl shadow-lg"
          >
            {isLoggingIn ? 'Connecting...' : isInitializing ? 'Loading...' : 'Get Started — Login'}
          </Button>
          <p className="text-white/60 text-sm mt-4">Powered by Internet Identity — no passwords needed</p>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="font-display text-2xl font-bold text-center text-foreground mb-10">
          Everything you need to freelance
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card rounded-xl p-6 border border-border shadow-xs text-center card-hover">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
