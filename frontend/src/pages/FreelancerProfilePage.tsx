import { useRouter, useParams } from '@tanstack/react-router';
import { useGetPublicProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, User, DollarSign, Download, Star, Briefcase } from 'lucide-react';

export default function FreelancerProfilePage() {
  const router = useRouter();
  const { userId } = useParams({ from: '/profile/$userId' });
  const { data: profile, isLoading } = useGetPublicProfile(userId);

  const handleDownloadResume = () => {
    if (profile?.resume) {
      const url = profile.resume.getDirectURL();
      window.open(url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="bg-card rounded-2xl border border-border p-8 space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-24 rounded-xl" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-7 w-20 rounded-full" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="font-semibold text-foreground mb-1">Profile not found</p>
        <p className="text-sm text-muted-foreground mb-4">This freelancer's profile doesn't exist or isn't public.</p>
        <Button variant="outline" onClick={() => router.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const displayName = profile.displayName || 'Anonymous Freelancer';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'FL';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-5 max-w-2xl">
          <button
            onClick={() => router.history.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="font-display text-2xl font-bold text-foreground">Freelancer Profile</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-5">
        {/* Profile Header */}
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
          <div className="flex items-start gap-5 mb-5">
            <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <span className="font-display text-2xl font-bold text-secondary">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-2xl font-bold text-foreground">{displayName}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {Number(profile.hourlyRate) > 0 && (
                  <div className="flex items-center gap-1.5 text-primary font-semibold text-sm">
                    <DollarSign className="h-4 w-4" />
                    ${Number(profile.hourlyRate)}/hr
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                  <Briefcase className="h-4 w-4" />
                  Freelancer
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mb-5">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">About</h3>
              <p className="text-foreground text-sm leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="mb-5">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-secondary/10 text-secondary text-sm px-3 py-1 rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Resume */}
          {profile.resume && (
            <div className="pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={handleDownloadResume}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download Resume
              </Button>
            </div>
          )}
        </div>

        {/* Empty state for no bio/skills */}
        {!profile.bio && (!profile.skills || profile.skills.length === 0) && (
          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <Star className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">This freelancer hasn't filled out their profile yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
