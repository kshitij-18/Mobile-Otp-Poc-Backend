import express from 'express';
import { getRedisClient } from './utils/redisSetup';
import { setupAndGetMongoClient } from './utils/setupMongoDb';
import authRouter from './routes/authRoutes';
import dotenv from 'dotenv';
import authServiceRouter from './routes/authRoutes';
import cors from 'cors';

dotenv.config();

const startApp = async () => {
    try {

        const app = express();

        // setting up global middlewares
        app.use(cors());

        // creating mongodb connection
        const client = await setupAndGetMongoClient();
        app.set('mongoClient', client);


        // Setting up Redis Client
        const redisClient = await getRedisClient();
        app.set('redisClient', redisClient);
        console.log('Redis Setup Successful');
        
        // creating middlewares
        app.use(express.json());


        app.use('/auth', authServiceRouter(app));

        app.listen(3000, () => console.log(`Server Started and listening on ${3000}`));

    } catch (error) {
        console.log('Error', error)
    }
}

startApp();
