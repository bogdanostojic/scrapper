import { Schema } from "mongoose"
import { Certification, Education, Experience } from "./util"

const ExpereinceSchema = new Schema<Experience>({
    title: String,
    employer: String,
    location: String,
    employmentPeriod: String,
    description: String
})

const EducationSchema = new Schema<Education>({
    university: String,
    degree: String,
    location: String,
    graduationDate: String,
    description: String
})

const CertificationSchema = new Schema<Certification>({
    title: String,
    employer: String,
    certificationperiod: String,
    description: String
})

export const details = {
    about: String,
    experience: [ExpereinceSchema],
    skills: [String],
    education: [EducationSchema],
    certification: [CertificationSchema]
}
