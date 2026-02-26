import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type UserProfile, type Job, type Proposal, type JobId, AppRole, ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useChooseRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (isFreelancer: boolean) => {
      if (!actor) throw new Error('Actor not available');
      return actor.chooseRole(isFreelancer);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useUpdateMyProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      displayName: string;
      bio: string;
      skills: string[];
      hourlyRate: bigint;
      resume: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMyProfile(
        params.displayName,
        params.bio,
        params.skills,
        params.hourlyRate,
        params.resume
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetPublicProfile(userId: string | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['publicProfile', userId],
    queryFn: async () => {
      if (!actor || !userId) return null;
      const principal = Principal.fromText(userId);
      return actor.getPublicProfile(principal);
    },
    enabled: !!actor && !actorFetching && !!userId,
  });
}

// ─── Jobs ────────────────────────────────────────────────────────────────────

export function useGetMyJobs() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Job[]>({
    queryKey: ['myJobs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyJobs();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllOpenJobs() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Job[]>({
    queryKey: ['allOpenJobs'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOpenJobs();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateJob() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      description: string;
      budget: bigint;
      category: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createJob(params.title, params.description, params.budget, params.category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myJobs'] });
      queryClient.invalidateQueries({ queryKey: ['allOpenJobs'] });
    },
  });
}

// ─── Proposals ───────────────────────────────────────────────────────────────

export function useGetProposalsForJob(jobId: JobId | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Proposal[]>({
    queryKey: ['proposals', jobId?.toString()],
    queryFn: async () => {
      if (!actor || jobId === undefined) return [];
      return actor.getProposalsForJob(jobId);
    },
    enabled: !!actor && !actorFetching && jobId !== undefined,
  });
}

export function useGetMyProposals() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Proposal[]>({
    queryKey: ['myProposals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyProposals();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSubmitProposal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      jobId: JobId;
      coverLetter: string;
      proposedPrice: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitProposal(params.jobId, params.coverLetter, params.proposedPrice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProposals'] });
      queryClient.invalidateQueries({ queryKey: ['allOpenJobs'] });
    },
  });
}

export function useAcceptProposal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { jobId: JobId; freelancerId: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.acceptProposal(params.jobId, params.freelancerId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myJobs'] });
      queryClient.invalidateQueries({ queryKey: ['proposals', variables.jobId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['allOpenJobs'] });
    },
  });
}
