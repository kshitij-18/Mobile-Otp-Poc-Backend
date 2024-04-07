import { MongoClient } from 'mongodb';

export const setupAndGetMongoClient = async () => {
    const client = new MongoClient('mongodb://127.0.0.1:27017/otp_verification');
    await client.connect();
    console.log('MongoDb Connected');
    return client;
}

