import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import planRoutes from './plan.routes.js';
import subscriptionRoutes from './subscription.routes.js';
import checkinRoutes from './checkin.routes.js';
import paymentRoutes from './payment.routes.js';
import couponRoutes from './coupon.routes.js';
import referralRoutes from './referral.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import devRoutes from './dev.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/plans', planRoutes);
apiRouter.use('/subscriptions', subscriptionRoutes);
apiRouter.use('/checkin', checkinRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/coupons', couponRoutes);
apiRouter.use('/referrals', referralRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/dev', devRoutes);

export default apiRouter;
