
import { BMProfile, partialToNullableProfile } from './profile.model';

export type BMApplicationStatus = 'unsubmitted' | 'submitted' | 'accepted' | 'rejected' | 'waitlisted';

export interface BMApplication {
    userId: string | null;
    whyBoilermake: string | null;
    projectIdeas: string | null;
    isFirstHackathon: boolean;
    agreeToTOC: boolean;
    status: BMApplicationStatus;
}

export const partialToNullabelBMApplication = (partial: Partial<BMApplication>): BMApplication => ({
    userId: partial?.userId ?? null,
    whyBoilermake: partial?.whyBoilermake ?? null,
    projectIdeas: partial?.projectIdeas ?? null,
    isFirstHackathon: partial?.isFirstHackathon ?? false,
    agreeToTOC: partial?.agreeToTOC ?? false,
    status: partial?.status ?? 'unsubmitted',
});

export interface BMFullApplication extends BMApplication, BMProfile {
}

export const partialToNullableBMFullApplication = (profile: Partial<BMProfile>, app: Partial<BMApplication>): BMFullApplication => ({
    ...partialToNullableProfile(profile),
    ...partialToNullabelBMApplication(app)
});
