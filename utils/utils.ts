import { MongoClient } from "mongodb";
import crypto from 'crypto';

export const ensureCollection = (collection: string, client: MongoClient) => {
    const db = client.db();
    return db.collection(collection);
}

export const generateOtp = (digits: number) => {
    const randomBytes = crypto.randomBytes(digits);
    const hexString = randomBytes.toString('hex');
    const decimalNumber = parseInt(hexString, 16);
    const otpInNumberForm = decimalNumber % (10**digits);
    return otpInNumberForm.toString().padStart(digits, '0')
}