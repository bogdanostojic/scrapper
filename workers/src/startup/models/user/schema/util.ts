

export interface User {
    email: string;
    password: string;
    resume: string;
    details?: Details
}

export interface Experience {
    title: string,
    employer: string,
    location: string,
    employmentPeriod: string,
    description: string
}

export interface Education {
    university: string,
    degree: string,
    location: string,
    graduationDate: string,
    description: string
}

export interface Certification {
    title: string,
    employer: string,
    certificationperiod: string,
    description: string
}

interface Details {
    about?: string;
    experience?: Array<Experience>;
    skills?: Array<string>;
    education?: Array<Education>;
    certification?: Array<Certification>
}