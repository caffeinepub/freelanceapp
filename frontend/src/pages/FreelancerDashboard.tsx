import { useEffect, useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetAllOpenJobs, useGetMyProposals } from '../hooks/useQueries';
import { AppRole, type Job } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import JobCard from '../components/JobCard';
import { Search, Briefcase, Send, CheckCircle2, User } from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'Web Development',
  'Mobile Development',
  'Design & Creative',
  'Writing & Content',
  'Data Science & AI',
  'Marketing & SEO',
  'Video & Animation',
  'DevOps & Cloud',
  'Blockchain & Web3',
  'Other',
];

export default function FreelancerDashboard() {
  const { identity } = useInternetIdentity();
  const router = useRouter();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: openJobs, isLoading: jobsLoading } = useGetAllOpenJobs();
  const { data: myProposals, isLoading: proposalsLoading } = useGetMyProposals();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

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

  const filteredJobs = openJobs?.filter((job) => {
    const matchesCategory = selectedCategory === 'All Categories' || job.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }) ?? [];

  const submittedJobIds = new Set(myProposals?.map((p) => p.jobId.toString()) ?? []);

  const stats = [
    { label: 'Open Jobs', value: openJobs?.length ?? 0, icon: Briefcase, color: 'text-primary' },
    { label: 'My Proposals', value: myProposals?.length ?? 0, icon: Send, color: 'text-secondary' },
  ];

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
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
              <h1 className="font-display text-2xl font-bold text-foreground">Freelancer Dashboard</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Welcome back, {userProfile?.displayName || 'Freelancer'}!
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.navigate({ to: '/profile/edit' })}
              className="gap-2"
            >
              <User className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
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

        {/* Tabs */}
        <Tabs defaultValue="browse">
          <TabsList className="mb-6">
            <TabsTrigger value="browse" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Browse Jobs
            </TabsTrigger>
            <TabsTrigger value="proposals" className="gap-2">
              <Send className="h-4 w-4" />
              My Proposals
            </TabsTrigger>
          </TabsList>

          {/* Browse Jobs Tab */}
          <TabsContent value="browse">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search jobs by title, description, or category..."
                  className="pl-9 h-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-52 h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {jobsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
              </div>
            ) : filteredJobs.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground mb-4">{filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredJobs.map((job) => {
                    const alreadyApplied = submittedJobIds.has(job.id.toString());
                    return (
                      <JobCard
                        key={job.id.toString()}
                        job={job}
                        actionSlot={
                          alreadyApplied ? (
                            <div className="flex items-center gap-1.5 text-xs text-secondary font-medium py-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Proposal Submitted
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              className="w-full text-xs bg-secondary text-secondary-foreground hover:bg-secondary/90"
                              onClick={() => router.navigate({ to: '/submit-proposal/$jobId', params: { jobId: job.id.toString() } })}
                            >
                              Submit Proposal
                            </Button>
                          )
                        }
                      />
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-16 bg-card rounded-2xl border border-border">
                <Briefcase className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold text-foreground mb-1">No jobs found</p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || selectedCategory !== 'All Categories'
                    ? 'Try adjusting your filters'
                    : 'No open jobs available right now. Check back soon!'}
                </p>
              </div>
            )}
          </TabsContent>

          {/* My Proposals Tab */}
          <TabsContent value="proposals">
            {proposalsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
              </div>
            ) : myProposals && myProposals.length > 0 ? (
              <div className="space-y-4">
                {myProposals.map((proposal, idx) => (
                  <ProposalItem key={`${proposal.jobId.toString()}-${idx}`} proposal={proposal} openJobs={openJobs ?? []} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-2xl border border-border">
                <Send className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold text-foreground mb-1">No proposals yet</p>
                <p className="text-sm text-muted-foreground">Browse open jobs and submit your first proposal!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ProposalItem({ proposal, openJobs }: { proposal: import('../backend').Proposal; openJobs: Job[] }) {
  const jobIsOpen = openJobs.some((j) => j.id === proposal.jobId);
  const statusLabel = jobIsOpen ? 'Pending' : 'Accepted / Closed';
  const statusClass = jobIsOpen
    ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
    : 'bg-green-100 text-green-700 border-green-200';

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Job #{proposal.jobId.toString()}</p>
          <p className="font-semibold text-foreground text-sm">Proposed Price: <span className="text-primary">${Number(proposal.proposedPrice).toLocaleString()}</span></p>
        </div>
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${statusClass}`}>
          {statusLabel}
        </span>
      </div>
      <div className="bg-muted/50 rounded-lg p-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Cover Letter</p>
        <p className="text-sm text-foreground line-clamp-3">{proposal.coverLetter}</p>
      </div>
    </div>
  );
}
