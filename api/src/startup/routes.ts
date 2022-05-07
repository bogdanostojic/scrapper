import express, { Express, Request, Response } from "express";
import { userRouter } from '../routes/user';
import mongoose from "mongoose";
import { connectionString } from "../config/database";
import redis, { RedisClientType } from 'redis';
function errorHandler(err: Error, req: Request, res: Response, next: Function ) {
  
  if(!err) return;
  
  console.log('middleware', err)
  return res.send({error: err}).json();
}

export async function startup (app: Express) {

  await mongoose.connect(connectionString);
  
  app.use(express.json());
  app.use("/user", userRouter);
  app.use(errorHandler);
};