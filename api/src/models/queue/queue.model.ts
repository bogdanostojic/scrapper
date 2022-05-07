import { model } from "mongoose";
import { QueueSchema } from "./schema/queue";


export const Queue = model('Queue', QueueSchema); 

