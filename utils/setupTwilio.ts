import TwilioClient from 'twilio';
import dotenv from 'dotenv'

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const accountAuthToken = process.env.TWILIO_ACCOUNT_AUTHTOKEN;
export const twilioClient = TwilioClient(accountSid, accountAuthToken);
