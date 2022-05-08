import express from 'express'

export const userRouter = express.Router();

import { addJob } from '../controllers/user';

userRouter.post('/addJob', addJob);
