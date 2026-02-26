import { useState, useEffect } from 'react';
import { useRouter, useParams } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetAllOpenJobs, useGetMyProposals, useSubmitProposal } from '../hooks/useQueries';
import { AppRole } from '../backend';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Send, DollarSign, Tag, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SubmitProposalPage() {
  const { identity } = useInternetIdentity();
  const router = useRouter();
  const { jobId } = useParams({ from: '/submit-proposal/$jobId' });
  const { data: userProfile, isFetched } = useGetCallerUserProfile();
  const { data: openJobs, isLoading: jobsLoading } = useGetAllOpenJobs();
  const { data: myProposals } = useGetMyProposals();
  const submitProposal = useSubmitProposal();

  const [coverLetter, setCoverLetter] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');

  const jobIdBigInt = BigInt(jobId);
  const job = openJobs?.find((j) => j.id === jobIdBigInt);
  const alreadyApplied = myProposals?.some((p) => p.jobId === jobIdBigInt);

  useEffect(() => {
    if (!identity) {
      router.navigate({ to: '/login' });
      return;
    }
    if (isFetched && userProfile === null) {
      router.navigate({ to: '/role-selection' });
      return;
    }
    if (isFetched && userProfile && userProfile.appRole !== AppRole.freelancer) {
      router.navigate({ to: '/customer-dashboard' });
    }
  }, [identity, userProfile, isFetched, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverLetter.trim()) {
      toast.error('Please write a cover letter');
      return;
    }
    const price = parseFloat(proposedPrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid proposed price');
      return;
    }
    try {
      await submitProposal.mutateAsync({
        jobId: jobIdBigInt,
        coverLetter: coverLetter.trim(),
        proposedPrice: BigInt(Math.round(price)),
      });
      toast.success('Proposal submitted successfully!');
      router.navigate({ to: '/freelancer-dashboard' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit proposal';
      toast.error(message);
    }
  };

  if (jobsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="h-32 bg-muted rounded-xl" />
          <div className="h-48 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Job not found or is no longer open.</p>
        <Button variant="outline" onClick={() => router.navigate({ to: '/freelancer-dashboard' })} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (alreadyApplied) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl text-center">
        <div className="bg-card rounded-2xl border border-border p-10">
          <CheckCircle2 className="h-14 w-14 text-secondary mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-foreground mb-2">Already Applied</h2>
          <p className="text-muted-foreground mb-6">You've already submitted a proposal for this job.</p>
          <Button onClick={() => router.navigate({ to: '/freelancer-dashboard' })}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-5 max-w-2xl">
          <button
            onClick={() => router.navigate({ to: '/freelancer-dashboard' })}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <h1 className="font-display text-2xl font-bold text-foreground">Submit Proposal</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        {/* Job Summary */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-display font-semibold text-foreground mb-2">{job.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-3">{job.description}</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-primary font-semibold">
              <DollarSign className="h-3.5 w-3.5" />
              Budget: ${Number(job.budget).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-secondary font-medium">
              <Tag className="h-3.5 w-3.5" />
              {job.category}
            </div>
          </div>
        </div>

        {/* Proposal Form */}
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-semibold">
              Your Proposed Price (USD) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
              <Input
                id="price"
                type="number"
                value={proposedPrice}
                onChange={(e) => setProposedPrice(e.target.value)}
                placeholder={Number(job.budget).toString()}
                className="h-11 pl-7"
                min="1"
              />
            </div>
            <p className="text-xs text-muted-foreground">Client's budget: ${Number(job.budget).toLocaleString()}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverLetter" className="text-sm font-semibold">
              Cover Letter <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Introduce yourself and explain why you're the best fit for this project. Mention relevant experience, your approach, and estimated timeline..."
              className="min-h-[180px] resize-none"
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">{coverLetter.length}/2000 characters</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.navigate({ to: '/freelancer-dashboard' })}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitProposal.isPending}
              className="flex-1 gap-2 font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              {submitProposal.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-secondary-foreground border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Proposal
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
