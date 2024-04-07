import express from 'express';
import { AuthService } from '../services/authService';
const router = express.Router();


const authServiceRouter = (app: express.Application) => {
    const authService = new AuthService(app);

    /**
     * POST Request which creates an otp and stores in Redis for invalidation.
     */
    router.post('/createOtp', authService.createOtpAndStoreInRedis);

    /**
     * GET request which verifies whether the otp is ok or not.
     */
    router.post('/verifyOtp', authService.verifyOtp);

    /**
     * POST request to signup a user
     */
    router.post('/signUp', authService.signUp);

    /**
     * Login call
     */
    router.post('/signIn', authService.signIn);

    return router;

}

export default authServiceRouter;