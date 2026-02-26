import { useState, useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useCreateJob } from '../hooks/useQueries';
import { AppRole } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
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

export default function CreateJobPage() {
  const { identity } = useInternetIdentity();
  const router = useRouter();
  const { data: userProfile, isFetched } = useGetCallerUserProfile();
  const createJob = useCreateJob();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !budget || !category) {
      toast.error('Please fill in all fields');
      return;
    }
    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      toast.error('Please enter a valid budget');
      return;
    }
    try {
      await createJob.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        budget: BigInt(Math.round(budgetNum)),
        category,
      });
      toast.success('Job posted successfully!');
      router.navigate({ to: '/customer-dashboard' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create job';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-5">
          <button
            onClick={() => router.navigate({ to: '/customer-dashboard' })}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <h1 className="font-display text-2xl font-bold text-foreground">Post a New Job</h1>
          <p className="text-muted-foreground text-sm mt-1">Describe your project to attract the right freelancers</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold">
              Job Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Build a React dashboard for my SaaS"
              className="h-11"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">{title.length}/100 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the project in detail: requirements, deliverables, timeline expectations..."
              className="min-h-[140px] resize-none"
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground">{description.length}/2000 characters</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-sm font-semibold">
                Budget (USD) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                <Input
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="500"
                  className="h-11 pl-7"
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview */}
          {(title || budget || category) && (
            <div className="bg-muted/50 rounded-xl p-4 border border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Preview</p>
              <div className="flex flex-wrap gap-2 text-sm">
                {title && <span className="font-semibold text-foreground">{title}</span>}
                {budget && <span className="text-primary font-medium">${Number(budget).toLocaleString()}</span>}
                {category && (
                  <span className="bg-secondary/10 text-secondary text-xs px-2 py-0.5 rounded-full font-medium">
                    {category}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.navigate({ to: '/customer-dashboard' })}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createJob.isPending}
              className="flex-1 gap-2 font-semibold"
            >
              {createJob.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Briefcase className="h-4 w-4" />
                  Post Job
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
