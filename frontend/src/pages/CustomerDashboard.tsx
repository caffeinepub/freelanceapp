import { useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetMyJobs, useGetProposalsForJob } from '../hooks/useQueries';
import { AppRole, type Job } from '../backend';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import JobCard from '../components/JobCard';
import { Plus, Briefcase, TrendingUp, CheckCircle2, Clock } from 'lucide-react';

function ProposalCountBadge({ jobId }: { jobId: bigint }) {
  const { data: proposals } = useGetProposalsForJob(jobId);
  return <span>{proposals?.length ?? 0}</span>;
}

export default function CustomerDashboard() {
  const { identity } = useInternetIdentity();
  const router = useRouter();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: jobs, isLoading: jobsLoading } = useGetMyJobs();

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

  const openJobs = jobs?.filter((j) => j.isOpen) ?? [];
  const closedJobs = jobs?.filter((j) => !j.isOpen) ?? [];

  const stats = [
    { label: 'Total Jobs', value: jobs?.length ?? 0, icon: Briefcase, color: 'text-primary' },
    { label: 'Open Jobs', value: openJobs.length, icon: TrendingUp, color: 'text-green-600' },
    { label: 'Closed Jobs', value: closedJobs.length, icon: CheckCircle2, color: 'text-secondary' },
  ];

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Page Header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Customer Dashboard
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage your job postings and find the right talent
              </p>
            </div>
            <Button
              onClick={() => router.navigate({ to: '/create-job' })}
              className="gap-2 font-semibold"
            >
              <Plus className="h-4 w-4" />
              Post New Job
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Jobs */}
        {jobsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div>
            {openJobs.length > 0 && (
              <section className="mb-8">
                <h2 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Open Jobs ({openJobs.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {openJobs.map((job) => (
                    <JobCard
                      key={job.id.toString()}
                      job={job}
                      onClick={() => router.navigate({ to: '/job/$jobId', params: { jobId: job.id.toString() } })}
                      proposalCount={0}
                      actionSlot={
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => router.navigate({ to: '/job/$jobId', params: { jobId: job.id.toString() } })}
                        >
                          View Proposals
                        </Button>
                      }
                    />
                  ))}
                </div>
              </section>
            )}

            {closedJobs.length > 0 && (
              <section>
                <h2 className="font-display font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-secondary" />
                  Closed Jobs ({closedJobs.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {closedJobs.map((job) => (
                    <JobCard
                      key={job.id.toString()}
                      job={job}
                      onClick={() => router.navigate({ to: '/job/$jobId', params: { jobId: job.id.toString() } })}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-card rounded-2xl border border-border">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-xl text-foreground mb-2">No jobs yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Post your first job to start receiving proposals from talented freelancers.
            </p>
            <Button onClick={() => router.navigate({ to: '/create-job' })} className="gap-2">
              <Plus className="h-4 w-4" />
              Post Your First Job
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
