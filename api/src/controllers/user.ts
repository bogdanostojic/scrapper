import { Request, Response } from "express";
import { User } from "../models/user/user.model";
import { UserDocument } from "../models/user/schema/user"
import { getChannel } from "../config/rabbitmq";
import path from "path";

export async function create(req: Request, res: Response, next: (param: any) => void) {
    const { email, password } = req.query;
    if(!email || !password) return res.send(`Must enter email and password`);

    let user: UserDocument;
    try {
        user = await User.findOneAndUpdate<UserDocument>({ email }, { email, password }, { new: true, upsert: true }).exec();
    } catch(error) {
        next(error);
        return;
    }
    getChannel().sendToQueue('task', Buffer.from(JSON.stringify({ email, password })), { persistent: true})
    return res.send(user).json()
};

export async function getAll(req: Request, res: Response, next: (param: any) => void) {
    const { email } = req.query;
    const users = await User.find( email ? { email } : {}).exec();
    return res.send(users).json();
}

export async function getResume(req: Request, res: Response, next: (param: any) => void) {
    const { name } = req.params;
    try {
        return res.download(path.join(__dirname, `../../downloads/resume/${name}`));
    } catch (error) {
        return res.send({error: `no resume found for ${name}`}).json();
    }
}