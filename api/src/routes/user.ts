import express from 'express'

export const userRouter = express.Router();

import { addJob } from '../controllers/user';

async function publishMiddleware(eventName: string, payload: Record<string, any>): Promise<void> {

    
}


userRouter.post('/addJob', addJob);
