import { useState, useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useUpdateMyProfile } from '../hooks/useQueries';
import { AppRole, ExternalBlob } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, User, X, Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileEditPage() {
  const { identity } = useInternetIdentity();
  const router = useRouter();
  const { data: userProfile, isFetched } = useGetCallerUserProfile();
  const updateProfile = useUpdateMyProfile();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

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

  // Pre-fill form with existing profile data
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setBio(userProfile.bio || '');
      setSkills(userProfile.skills || []);
      setHourlyRate(userProfile.hourlyRate ? Number(userProfile.hourlyRate).toString() : '');
    }
  }, [userProfile]);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error('Please enter your display name');
      return;
    }

    let resumeBlob: ExternalBlob | null = userProfile?.resume ?? null;

    if (resumeFile) {
      setIsUploading(true);
      try {
        const bytes = new Uint8Array(await resumeFile.arrayBuffer());
        resumeBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((pct) => {
          setUploadProgress(pct);
        });
      } catch {
        toast.error('Failed to process resume file');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    try {
      await updateProfile.mutateAsync({
        displayName: displayName.trim(),
        bio: bio.trim(),
        skills,
        hourlyRate: BigInt(Math.round(parseFloat(hourlyRate) || 0)),
        resume: resumeBlob,
      });
      toast.success('Profile updated successfully!');
      router.navigate({ to: '/freelancer-dashboard' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      toast.error(message);
    }
  };

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
          <h1 className="font-display text-2xl font-bold text-foreground">Edit Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">Update your freelancer profile to attract more clients</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 sm:p-8 space-y-6">
          {/* Avatar placeholder */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-secondary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{displayName || 'Your Name'}</p>
              <p className="text-sm text-muted-foreground">Freelancer Profile</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-sm font-semibold">
              Display Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your full name or professional alias"
              className="h-11"
              maxLength={60}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-semibold">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell clients about yourself, your experience, and what makes you unique..."
              className="min-h-[120px] resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">{bio.length}/1000 characters</p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">Skills</Label>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="e.g. React, Python, Figma..."
                className="h-10 flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={addSkill} className="h-10 px-3">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 bg-secondary/10 text-secondary text-sm px-3 py-1 rounded-full font-medium"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourlyRate" className="text-sm font-semibold">Hourly Rate (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
              <Input
                id="hourlyRate"
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                placeholder="50"
                className="h-11 pl-7"
                min="0"
              />
            </div>
            <p className="text-xs text-muted-foreground">Per hour rate displayed on your profile</p>
          </div>

          {/* Resume Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Resume / CV</Label>
            <div className="border-2 border-dashed border-border rounded-xl p-5 text-center">
              {resumeFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Upload className="h-4 w-4 text-secondary" />
                    <span className="font-medium">{resumeFile.name}</span>
                    <span className="text-muted-foreground">({(resumeFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setResumeFile(null)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    {userProfile?.resume ? 'Replace your current resume' : 'Upload your resume'}
                  </p>
                  <label className="cursor-pointer">
                    <span className="text-sm font-medium text-secondary hover:underline">Choose file</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX up to 5MB</p>
                </>
              )}
            </div>
            {isUploading && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-secondary rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
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
              disabled={updateProfile.isPending || isUploading}
              className="flex-1 gap-2 font-semibold"
            >
              {updateProfile.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
