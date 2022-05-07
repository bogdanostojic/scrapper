import { Schema, Document } from "mongoose"
import { details } from "./details.";
import { User } from "./util";

const options = {
    timestamps: true
}



export const UserSchema = new Schema<User>({ 
    email: { type: String, required: true },
    password: { type: String, required: true },
    resume: String,
    details

}, options);

export type UserDocument = typeof UserSchema & Document;
