import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Category = string;
export type UserId = Principal;
export interface Job {
    id: JobId;
    title: string;
    customer: UserId;
    description: string;
    isOpen: boolean;
    category: Category;
    budget: bigint;
}
export type JobId = bigint;
export interface Proposal {
    jobId: JobId;
    coverLetter: string;
    proposedPrice: bigint;
    freelancer: UserId;
}
export interface UserProfile {
    bio: string;
    resume?: ExternalBlob;
    displayName: string;
    appRole: AppRole;
    hourlyRate: bigint;
    skills: Array<string>;
}
export enum AppRole {
    customer = "customer",
    freelancer = "freelancer"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptProposal(jobId: JobId, freelancerId: UserId): Promise<Proposal>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    chooseRole(isFreelancer: boolean): Promise<void>;
    createJob(title: string, description: string, budget: bigint, category: Category): Promise<JobId>;
    downloadResume(userId: UserId): Promise<ExternalBlob | null>;
    getAllOpenJobs(): Promise<Array<Job>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getJobsByCustomer(customerId: UserId): Promise<Array<Job>>;
    getMyJobs(): Promise<Array<Job>>;
    getMyProposals(): Promise<Array<Proposal>>;
    getOpenJobsByCategory(category: Category): Promise<Array<Job>>;
    getProposalsForJob(jobId: JobId): Promise<Array<Proposal>>;
    getPublicProfile(userId: UserId): Promise<UserProfile | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitProposal(jobId: JobId, coverLetter: string, proposedPrice: bigint): Promise<void>;
    updateMyProfile(displayName: string, bio: string, skills: Array<string>, hourlyRate: bigint, resume: ExternalBlob | null): Promise<void>;
}
