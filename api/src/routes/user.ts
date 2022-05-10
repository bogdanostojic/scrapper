import express from 'express'

export const userRouter = express.Router();

import { create, getAll, getResume } from '../controllers/user';

userRouter.post('/create', create);
userRouter.get('/', getAll);
userRouter.get('/resume/:name', getResume);

