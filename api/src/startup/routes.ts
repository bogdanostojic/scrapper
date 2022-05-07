import express, { Express } from "express";
import { userRouter } from '../routes/user';

export function startup (app: Express) {
  app.use(express.json());
  app.use("/user", userRouter);
};