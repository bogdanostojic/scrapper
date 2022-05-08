import { Request, Response } from "express";
import { User } from "../models/user/user.model";
import { UserDocument } from "../models/user/schema/user"
import { getChannel } from "../config/rabbitmq";

export async function addJob(req: Request, res: Response, next: (param: any) => void) {
    const { email, password } = req.query;
    if(!email || !password) return res.send(`Must enter email and password`);

    let user: UserDocument;
    try {
        user = await User.findOneAndUpdate<UserDocument>({ email }, { email, password }, { new: true, upsert: true }).exec();
    } catch(error) {
        next(error);
        return;
    }
    console.log(user);
    console.log(req.body);
    getChannel().sendToQueue('task', Buffer.from(JSON.stringify({ email, password })), { persistent: true})
    
    return res.send(user).json()
};