import { useEffect } from 'react';
import { useRouter, useParams } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetProposalsForJob, useAcceptProposal, useGetPublicProfile } from '../hooks/useQueries';
import { AppRole, type Proposal } from '../backend';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, DollarSign, Tag, User, CheckCircle2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';
import { useGetMyJobs } from '../hooks/useQueries';

function ProposalCard({ proposal, onAccept, isAccepting, jobIsOpen }: {
  proposal: Proposal;
  onAccept: (freelancerId: Principal) => void;
  isAccepting: boolean;
  jobIsOpen: boolean;
}) {
  const router = useRouter();
  const freelancerId = proposal.freelancer.toString();
  const { data: profile } = useGetPublicProfile(freelancerId);

  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <button
              onClick={() => router.navigate({ to: '/profile/$userId', params: { userId: freelancerId } })}
              className="font-semibold text-foreground hover:text-primary transition-colors text-sm"
            >
              {profile?.displayName || 'Anonymous Freelancer'}
            </button>
            {profile?.skills && profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {profile.skills.slice(0, 3).map((skill) => (
                  <span key={skill} className="text-xs bg-secondary/10 text-secondary px-1.5 py-0.5 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-primary">${Number(proposal.proposedPrice).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">proposed price</p>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cover Letter</span>
        </div>
        <p className="text-sm text-foreground leading-relaxed">{proposal.coverLetter}</p>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.navigate({ to: '/profile/$userId', params: { userId: freelancerId } })}
          className="flex-1 text-xs"
        >
          View Profile
        </Button>
        {jobIsOpen && (
          <Button
            size="sm"
            onClick={() => onAccept(proposal.freelancer)}
            disabled={isAccepting}
            className="flex-1 text-xs gap-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            {isAccepting ? (
              <div className="w-3 h-3 border-2 border-secondary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            Accept Proposal
          </Button>
        )}
      </div>
    </div>
  );
}

export default function JobDetailsPage() {
  const { identity } = useInternetIdentity();
  const router = useRouter();
  const { jobId } = useParams({ from: '/job/$jobId' });
  const { data: userProfile, isFetched } = useGetCallerUserProfile();
  const { data: myJobs, isLoading: jobsLoading } = useGetMyJobs();
  const jobIdBigInt = BigInt(jobId);
  const { data: proposals, isLoading: proposalsLoading } = useGetProposalsForJob(jobIdBigInt);
  const acceptProposal = useAcceptProposal();

  const job = myJobs?.find((j) => j.id === jobIdBigInt);

  useEffect(() => {
    if (!identity) {
      router.navigate({ to: '/login' });
      return;
    }
    if (isFetched && userProfile === null) {
      router.navigate({ to: '/role-selection' });
      return;
    }
    if (isFetched && userProfile && userProfile.appRole !== AppRole.customer) {
      router.navigate({ to: '/freelancer-dashboard' });
    }
  }, [identity, userProfile, isFetched, router]);

  const handleAccept = async (freelancerId: Principal) => {
    try {
      await acceptProposal.mutateAsync({ jobId: jobIdBigInt, freelancerId });
      toast.success('Proposal accepted! The job is now in progress.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to accept proposal';
      toast.error(message);
    }
  };

  if (jobsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-40 rounded-xl mb-6" />
        <div className="space-y-4">
          {[1, 2].map((i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Job not found or you don't have access.</p>
        <Button variant="outline" onClick={() => router.navigate({ to: '/customer-dashboard' })} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-5 max-w-3xl">
          <button
            onClick={() => router.navigate({ to: '/customer-dashboard' })}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-2xl font-bold text-foreground">{job.title}</h1>
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${
              job.isOpen ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${job.isOpen ? 'bg-green-500' : 'bg-gray-400'}`} />
              {job.isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        {/* Job Details Card */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-display font-semibold text-foreground mb-3">Job Details</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">{job.description}</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-primary font-semibold">
              <DollarSign className="h-4 w-4" />
              Budget: ${Number(job.budget).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-secondary font-medium">
              <Tag className="h-4 w-4" />
              {job.category}
            </div>
          </div>
        </div>

        {/* Proposals */}
        <div>
          <h2 className="font-display font-semibold text-lg text-foreground mb-4">
            Proposals ({proposals?.length ?? 0})
          </h2>
          {proposalsLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
            </div>
          ) : proposals && proposals.length > 0 ? (
            <div className="space-y-4">
              {proposals.map((proposal, idx) => (
                <ProposalCard
                  key={`${proposal.freelancer.toString()}-${idx}`}
                  proposal={proposal}
                  onAccept={handleAccept}
                  isAccepting={acceptProposal.isPending}
                  jobIsOpen={job.isOpen}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold text-foreground mb-1">No proposals yet</p>
              <p className="text-sm text-muted-foreground">Freelancers will submit proposals here once they find your job.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
