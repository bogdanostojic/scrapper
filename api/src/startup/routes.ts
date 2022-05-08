import express, { Express } from "express";
import mongoose from "mongoose";
import { userRouter } from '../routes/user';
import { connectionString } from "../config/database";
import { errorHandler } from "../middleware/error";
import { amqplibConnection  } from "../config/rabbitmq";

export async function startup (app: Express) {

  await mongoose.connect(connectionString);
  await amqplibConnection();
  app.use(express.json());
  app.use("/user", userRouter);
  app.use(errorHandler);
};