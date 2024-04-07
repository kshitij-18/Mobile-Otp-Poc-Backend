import { Request, Response, Express, Application } from 'express';
import { getRedisClient } from '../utils/redisSetup';
import { twilioClient } from '../utils/setupTwilio';
import { generateOtp } from '../utils/utils';
import { MongoClient } from 'mongodb';
import { NotFoundError } from '../errors/NotFoundError';
import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

enum otpErrorEnum {
    Expired = "Expired",
    WrongOtp = "WrongOtp",
}

export class AuthService {
    private mongoClient: MongoClient;
    constructor (app: Application) {
        console.log('THIS IN CONSTRUCTOR', this);
        this.mongoClient = app.get('mongoClient') as MongoClient;
        dotenv.config();
        this.createOtpAndStoreInRedis = this.createOtpAndStoreInRedis.bind(this);
        this.verifyOtp = this.verifyOtp.bind(this);
        this.signUp = this.signUp.bind(this);
        this.signIn = this.signIn.bind(this);
    }
    async createOtpAndStoreInRedis(req: Request, res: Response) {
        const { mobileNumber } = req.body;
        const redisClient = await getRedisClient();
        const otp = generateOtp(4);
        twilioClient.messages.create({
            body: `Hi here is your otp to login to my awesome app ${otp}`,
            to: `+91${mobileNumber}`,
            from: "+13347218494",
        })

        // store in redis for verifying and add TTL of 30 seconds.
        await redisClient.set(mobileNumber, otp, {
            EX: 30000,
        });
        res.json({
            mobileNumber,
            otp
        })
    }

    async verifyOtp(req: Request, res: Response) {
        const { mobileNumber: mobileNumberFromBody, otp: otpReceivedFromBody } = req.body;
        const redisClient = await getRedisClient();
        try {
            const otpFromRedis = await redisClient.get(mobileNumberFromBody);
            if (!otpFromRedis) {
                return res.status(400).json({
                    message: 'Otp for this mobilenumber does not exist or has expired.',
                    type: otpErrorEnum.Expired,
                })
            }
            if (otpFromRedis !== otpReceivedFromBody) {
                return res.status(400).json({
                    message: 'Otp is wrong',
                    type: otpErrorEnum.WrongOtp,
                })
            }
            const user = await this.verifyUser(mobileNumberFromBody);
            res.json({
                user,
            });
        } catch (error) {
            if (error instanceof NotFoundError && error.message && error.code) {
                return res.status(error.code).json({
                    error: error.message,
                })
            }
            if (error instanceof Error && error.message) {
                return res.status(400).json({
                    error: error.message,
                })
            } else {
                return res.status(500).json({
                    error: 'Unknown error occured.'
                })
            }
        }
    }

    // To Identify whether user is in the db or not.
    async verifyUser(mobileNumber: string) {
            const user = await this.mongoClient.db('otp_verification').collection('users').findOne({mobileNumber});
            if (user) {
               return user;
            }
        throw new NotFoundError({ message: 'No User with that Phone Number was found.', code: 404 });
    }

    async signUp(req: Request, res: Response) {
        try {
            const collection = this.mongoClient.db('otp_verification').collection('users');
            await collection.insertOne(req.body);
            const user = await collection.findOne({mobileNumber: req.body.mobileNumber}, { projection: { _id: 0 } });
            const token = jwt.sign(JSON.stringify(user), 'mysecretkey');
            res.cookie('authorization', `Bearer ${token}`, {
                httpOnly: true,
            }).json({
                user,
            });
        } catch (error) {
            console.log('ERROR', error);
            console.error('Error in Signing You up.')
        }
    }

    async signIn(req: Request, res: Response) {
        try {
            const collection = this.mongoClient.db('otp_verification').collection('users');
            const user = await collection.findOne({mobileNumber: req.body.mobileNumber});
            const token = jwt.sign(JSON.stringify(user), 'mysecretkey');
            res.cookie('authorization', `Bearer ${token}`, {
                httpOnly: true,
            }).json({
                user,
            });
        } catch (error) {
            console.log('ERROR', error);
            console.error('Error in Signing You in.')
        }
    }

    
}