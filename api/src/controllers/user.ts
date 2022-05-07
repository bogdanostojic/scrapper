import { Request, Response } from "express";
import { User } from "../models/user/user.model";
import { UserDocument, UserSchema } from "../models/user/schema/user"

interface AddJobQuery {
    email: string;
    password: string;
}

export async function addJob(req: Request, res: Response, next: (param: any) => void) {
    const query = req.query as unknown as AddJobQuery;
    const { email, password } = query;
    if(!email || !password) return res.send(`Must enter email and password`);

    let user: UserDocument;
    try {
        user = await User.findOneAndUpdate<UserDocument>({ email }, { email, password }, { new: true, upsert: true }).exec();
    } catch(error ) {
        next(error as Error);
        return;
    }
    console.log(user);
    console.log(req.body);
    return res.send(user).json()
};