import { type Job } from '../backend';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Tag, Clock, Users } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onClick?: () => void;
  proposalCount?: number;
  actionSlot?: React.ReactNode;
}

export default function JobCard({ job, onClick, proposalCount, actionSlot }: JobCardProps) {
  const statusLabel = job.isOpen ? 'Open' : 'Closed';
  const statusClass = job.isOpen
    ? 'bg-green-100 text-green-700 border-green-200'
    : 'bg-gray-100 text-gray-600 border-gray-200';

  return (
    <div
      className={`bg-card rounded-xl border border-border shadow-xs p-5 flex flex-col gap-3 card-hover ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display font-semibold text-foreground text-base leading-snug line-clamp-2 flex-1">
          {job.title}
        </h3>
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${statusClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${job.isOpen ? 'bg-green-500' : 'bg-gray-400'}`} />
          {statusLabel}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
        {job.description}
      </p>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-1.5 text-primary font-semibold">
          <DollarSign className="h-3.5 w-3.5" />
          <span>${Number(job.budget).toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5 text-secondary font-medium">
          <Tag className="h-3.5 w-3.5" />
          <span>{job.category}</span>
        </div>
        {proposalCount !== undefined && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{proposalCount} proposal{proposalCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Action slot */}
      {actionSlot && (
        <div className="pt-1 border-t border-border" onClick={(e) => e.stopPropagation()}>
          {actionSlot}
        </div>
      )}
    </div>
  );
}
