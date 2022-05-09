import amqplib, { Connection, Channel } from 'amqplib'


let connection: Connection, channel: Channel;
export async function amqplibConnection() {

    if(!connection) connection = await amqplib.connect('amqp://localhost');
    if(!channel) channel = await connection.createChannel();

    await channel.assertQueue('task', { durable: true});
    await channel.assertQueue('error', { durable: true});
    channel.prefetch(1);
}

export function getChannel(): Channel {
    return channel;
}
