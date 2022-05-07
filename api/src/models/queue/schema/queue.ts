import { Schema } from "mongoose"

const options = {
    timestamps: true
}
// miliseconds
const retryJob = 60000 

export const QueueSchema = new Schema({ 
    maxJobRetries: { type: Number, default: 3 },
    maxConcurrentJobs: { type: Number, default: 2},
    retryJobAfter: { type: Number, default: retryJob},
}, options);


