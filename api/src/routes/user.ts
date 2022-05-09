import express from 'express'

export const userRouter = express.Router();

import { create, getAll } from '../controllers/user';

userRouter.post('/create', create);
userRouter.get('/', getAll);

