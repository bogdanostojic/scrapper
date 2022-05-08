import amqplib, { Connection, Channel } from 'amqplib'
import { User } from '../models/user/user.model';


let connection: Connection, channel: Channel;
export async function amqplibConnection() {

    if(!connection) connection = await amqplib.connect('amqp://localhost');
    if(!channel) channel = await connection.createChannel();

    await channel.assertQueue('task', { durable: true});
    await channel.assertQueue('error', { durable: true});


    channel.consume('error', async msg => {
        if(!msg) {
            console.log('msg is null');
            console.log(msg)
            return;
        }
        const { email }  = JSON.parse(msg.content.toString('utf-8'));

        console.log('deleting', `${email}`);
        await User.deleteOne( { email });
        channel.ack(msg)
    })
}

export function getChannel(): Channel {
    return channel;
}
