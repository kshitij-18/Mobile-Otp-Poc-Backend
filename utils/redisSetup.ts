import { createClient } from "redis";

export const getRedisClient = async () => {
    const client = await createClient().on('error', () => console.log('Error Occured.')).connect();
    return client;
}