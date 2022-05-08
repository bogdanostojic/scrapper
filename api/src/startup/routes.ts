import express, { Express, Request, Response } from "express";
import { userRouter } from '../routes/user';
import mongoose from "mongoose";
import { connectionString } from "../config/database";
import redis, { RedisClientType } from 'redis';
function errorHandler(error: Error, req: Request, res: Response, next: Function ) {
  
  if(!error) return;
  const { message } = error;
  console.error('Error stack trace:', error)
  return res.send({error: message}).json();
}

export async function startup (app: Express) {

  await mongoose.connect(connectionString);
  
  app.use(express.json());
  app.use("/user", userRouter);
  app.use(errorHandler);
};