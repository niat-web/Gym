import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Plan } from '../src/models/Plan.js';
import { Coupon } from '../src/models/Coupon.js';
import { Subscription } from '../src/models/Subscription.js';
import { Payment } from '../src/models/Payment.js';
import { Referral } from '../src/models/Referral.js';
import { subDays, addDays, todayIST } from '../src/utils/date.js';

describe('FitCore API Suite', () => {
  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  beforeEach(async () => {
    // Clear collections between test runs
    await Promise.all([
      User.deleteMany({}),
      Plan.deleteMany({}),
      Coupon.deleteMany({}),
      Subscription.deleteMany({}),
      Payment.deleteMany({}),
      Referral.deleteMany({}),
    ]);
  });

  describe('1. Health Check Endpoint', () => {
    it('GET /health returns connected status and uptime', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.db).toBe('connected');
      expect(res.body.data.status).toBe('ok');
    });
  });

  describe('2. Authentication & Security Flow', () => {
    it('Registers member, logs in, refreshes token, and rejects stale tokens after logout', async () => {
      // 1. Register
      const regRes = await request(app).post('/api/v1/auth/register').send({
        phone: '9876500001',
        fullName: 'Test Member',
        password: 'Password@123',
        email: 'test@member.com',
      });

      expect(regRes.status).toBe(201);
      expect(regRes.body.success).toBe(true);
      expect(regRes.body.data.user.phone).toBe('+919876500001');
      expect(regRes.body.data.user.role).toBe('member');
      expect(regRes.body.data.user.myReferralCode).toBeDefined();
      expect(regRes.body.data.tokens.accessToken).toBeDefined();

      const { accessToken, refreshToken } = regRes.body.data.tokens;

      // 2. Access protected endpoint with token
      const meRes = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(meRes.status).toBe(200);
      expect(meRes.body.data.fullName).toBe('Test Member');

      // 3. Refresh token
      const refreshRes = await request(app).post('/api/v1/auth/refresh').send({
        refreshToken,
      });
      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.data.tokens.accessToken).toBeDefined();
      const newAccessToken = refreshRes.body.data.tokens.accessToken;

      // 4. Logout
      const logoutRes = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${newAccessToken}`);
      expect(logoutRes.status).toBe(200);

      // 5. Old token should now be rejected (TOKEN_STALE)
      const staleRes = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${newAccessToken}`);
      expect(staleRes.status).toBe(401);
      expect(staleRes.body.error.code).toBe('TOKEN_STALE');
    });

    it('Enforces role-based guards (Member cannot access admin endpoints)', async () => {
      const regRes = await request(app).post('/api/v1/auth/register').send({
        phone: '9876500002',
        fullName: 'Regular Member',
        password: 'Password@123',
      });
      const token = regRes.body.data.tokens.accessToken;

      // Try calling admin coupon list
      const adminRes = await request(app)
        .get('/api/v1/coupons')
        .set('Authorization', `Bearer ${token}`);
      expect(adminRes.status).toBe(403);
      expect(adminRes.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('3. Coupon Validation Matrix & Pricing', () => {
    it('Validates min price, max percentage cap, and flat discounts correctly', async () => {
      // Create user
      const userRes = await request(app).post('/api/v1/auth/register').send({
        phone: '9876500003',
        fullName: 'Coupon Tester',
        password: 'Password@123',
      });
      const token = userRes.body.data.tokens.accessToken;

      // Create Plan: ₹2,000 (200000 paise)
      const plan = await Plan.create({
        planName: 'Standard Plan',
        description: 'Standard access',
        category: 'standard',
        pricePaise: 200000,
        calendarDays: 30,
        allocatedDays: 26,
      });

      // 1. Valid Percentage Coupon: 50% capped at ₹500 (50000 paise)
      await Coupon.create({
        code: 'HALF50',
        name: '50% Off Cap 500',
        description: 'Test coupon',
        discountType: 'percentage',
        discountValue: 50,
        minPlanPricePaise: 100000,
        maxDiscountPaise: 50000, // Cap at ₹500
        maxUses: 100,
        applicableTo: ['all'],
        validFrom: subDays(new Date(), 1),
        validUntil: addDays(new Date(), 30),
        isActive: true,
      });

      const validateRes = await request(app)
        .get(`/api/v1/coupons/validate/HALF50?planId=${plan._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(validateRes.status).toBe(200);
      expect(validateRes.body.data.isValid).toBe(true);
      expect(validateRes.body.data.discountPaise).toBe(50000); // capped at 50000
      expect(validateRes.body.data.finalPricePaise).toBe(150000); // 200000 - 50000 = 150000
    });
  });

  describe('4. Checkout, Subscriptions & Idempotent Verify', () => {
    it('Processes mock payment, creates subscription, and handles duplicate verify idempotently', async () => {
      // 1. Register Member
      const regRes = await request(app).post('/api/v1/auth/register').send({
        phone: '9876500004',
        fullName: 'Payer Member',
        password: 'Password@123',
      });
      const token = regRes.body.data.tokens.accessToken;

      // 2. Create Plan
      const plan = await Plan.create({
        planName: 'Starter Gym Plan',
        description: 'Starter test',
        category: 'basic',
        pricePaise: 150000,
        calendarDays: 30,
        allocatedDays: 26,
      });

      // 3. Initiate Payment
      const initRes = await request(app)
        .post('/api/v1/payments/initiate')
        .set('Authorization', `Bearer ${token}`)
        .send({ planId: plan._id.toString() });

      expect(initRes.status).toBe(200);
      expect(initRes.body.data.amountPaise).toBe(150000);
      const { paymentId, orderId } = initRes.body.data;

      // 4. Verify Payment (First time)
      const verifyRes1 = await request(app)
        .post('/api/v1/payments/verify')
        .set('Authorization', `Bearer ${token}`)
        .send({
          paymentId,
          razorpayOrderId: orderId,
          razorpayPaymentId: 'mock_pay_12345',
          razorpaySignature: 'mock_signature',
        });

      expect(verifyRes1.status).toBe(200);
      expect(verifyRes1.body.data.subscription).toBeDefined();
      expect(verifyRes1.body.data.subscription.daysRemaining).toBe(26);

      // 5. Verify Payment (Second time - duplicate request)
      const verifyRes2 = await request(app)
        .post('/api/v1/payments/verify')
        .set('Authorization', `Bearer ${token}`)
        .send({
          paymentId,
          razorpayOrderId: orderId,
          razorpayPaymentId: 'mock_pay_12345',
          razorpaySignature: 'mock_signature',
        });

      expect(verifyRes2.status).toBe(200);
      // Ensure only 1 subscription exists in DB
      const allSubs = await Subscription.find({ user: regRes.body.data.user.id });
      expect(allSubs.length).toBe(1);
    });
  });

  describe('5. Attendance Check-in Engine', () => {
    it('Deducts 1 day on first check-in, ignores duplicate same-day check-in, and refuses expired sub', async () => {
      // 1. Create Trainer
      const trainer = await User.create({
        phone: '+919876500099',
        fullName: 'Trainer Test',
        passwordHash: 'hash',
        role: 'trainer',
        myReferralCode: 'TRAI9999',
      });
      const trainerToken = request(app);

      // Sign trainer token
      const jwt = (await import('jsonwebtoken')).default;
      const { env } = await import('../src/config/env.js');
      const token = jwt.sign(
        { sub: trainer._id.toString(), role: 'trainer', ver: 0, type: 'access' },
        env.JWT_ACCESS_SECRET
      );

      // 2. Create Member with Active Subscription
      const member = await User.create({
        phone: '+919876500088',
        fullName: 'Gym Goer',
        passwordHash: 'hash',
        role: 'member',
        myReferralCode: 'GYMG8888',
      });

      const plan = await Plan.create({
        planName: 'Monthly 26',
        description: 'desc',
        category: 'basic',
        pricePaise: 150000,
        calendarDays: 30,
        allocatedDays: 26,
      });

      const sub = await Subscription.create({
        user: member._id,
        plan: plan._id,
        planSnapshot: {
          planName: plan.planName,
          pricePaise: plan.pricePaise,
          allocatedDays: plan.allocatedDays,
          calendarDays: plan.calendarDays,
          features: [],
        },
        status: 'active',
        allocatedDays: 26,
        daysUsed: 0,
        daysRemaining: 26,
        startsOn: new Date(),
        expiresOn: addDays(new Date(), 30),
        attendanceLog: [],
      });

      member.activeSubscription = sub._id as any;
      await member.save();

      // 3. First check-in today
      const checkin1 = await request(app)
        .post('/api/v1/checkin')
        .set('Authorization', `Bearer ${token}`)
        .send({ memberId: member._id.toString() });

      expect(checkin1.status).toBe(200);
      expect(checkin1.body.data.isFirstToday).toBe(true);
      expect(checkin1.body.data.daysRemaining).toBe(25);

      // 4. Second check-in on SAME day
      const checkin2 = await request(app)
        .post('/api/v1/checkin')
        .set('Authorization', `Bearer ${token}`)
        .send({ phone: member.phone });

      expect(checkin2.status).toBe(200);
      expect(checkin2.body.data.isFirstToday).toBe(false);
      expect(checkin2.body.data.daysRemaining).toBe(25); // No extra visit deducted!

      // 5. Expire the subscription and check rejection
      sub.expiresOn = subDays(new Date(), 2);
      await sub.save();

      const checkinExpired = await request(app)
        .post('/api/v1/checkin')
        .set('Authorization', `Bearer ${token}`)
        .send({ memberId: member._id.toString() });

      expect(checkinExpired.status).toBe(403);
      expect(checkinExpired.body.error.code).toBe('SUBSCRIPTION_EXPIRED');
    });
  });

  describe('6. Referral System & First-Purchase Bonus', () => {
    it('Grants referee ₹200 discount and referrer 500 loyalty points on first purchase', async () => {
      // 1. Member A registers
      const userARes = await request(app).post('/api/v1/auth/register').send({
        phone: '9876500010',
        fullName: 'Member A (Referrer)',
        password: 'Password@123',
      });
      const userACode = userARes.body.data.user.myReferralCode;

      // 2. Member B registers with Member A's referral code
      const userBRes = await request(app).post('/api/v1/auth/register').send({
        phone: '9876500020',
        fullName: 'Member B (Referee)',
        password: 'Password@123',
        referralCode: userACode,
      });
      const tokenB = userBRes.body.data.tokens.accessToken;

      // 3. Create Plan: ₹1,500 (150000 paise)
      const plan = await Plan.create({
        planName: 'Starter 1500',
        description: 'desc',
        category: 'basic',
        pricePaise: 150000,
        calendarDays: 30,
        allocatedDays: 26,
      });

      // 4. Member B initiates purchase (referral discount ₹200 / 20000 paise should auto-apply)
      const initRes = await request(app)
        .post('/api/v1/payments/initiate')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ planId: plan._id.toString() });

      expect(initRes.status).toBe(200);
      expect(initRes.body.data.discountBreakdown.referralDiscountPaise).toBe(20000); // ₹200 off
      expect(initRes.body.data.amountPaise).toBe(130000); // 150000 - 20000 = 130000 paise

      // 5. Member B completes payment
      const verifyRes = await request(app)
        .post('/api/v1/payments/verify')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          paymentId: initRes.body.data.paymentId,
          razorpayOrderId: initRes.body.data.orderId,
          razorpayPaymentId: 'mock_pay_ref_1',
          razorpaySignature: 'mock_signature',
        });

      expect(verifyRes.status).toBe(200);

      // 6. Check Referrer A's loyalty points: should be +500
      const referrerA = await User.findById(userARes.body.data.user.id);
      expect(referrerA?.loyaltyPoints).toBe(500);

      const referralDoc = await Referral.findOne({ referrer: userARes.body.data.user.id });
      expect(referralDoc?.successfulConversions).toBe(1);
    });
  });
});
