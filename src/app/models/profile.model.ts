
export interface BMProfile {
    uid: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    gender: string | null;
    major: string | null;
    university: string | null;
    gradYear: string | null;
    github: string | null;
    linkedIn: string | null;
    resumeId: string | null;
}

export const partialToNullableProfile = (partialProfile: Partial<BMProfile>): BMProfile => ({
    uid: partialProfile.uid ?? null,
    firstName: partialProfile.firstName ?? null,
    lastName: partialProfile.lastName ?? null,
    email: partialProfile.email ?? null,
    phone: partialProfile.phone ?? null,
    gender: partialProfile.gender ?? null,
    major: partialProfile.major ?? null,
    university: partialProfile.university ?? null,
    gradYear: partialProfile.gradYear ?? null,
    github: partialProfile.github ?? null,
    linkedIn: partialProfile.linkedIn ?? null,
    resumeId: partialProfile.resumeId ?? null,
});
