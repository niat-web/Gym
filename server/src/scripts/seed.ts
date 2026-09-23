import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { User, IUser } from '../models/User.js';
import { Plan, IPlan } from '../models/Plan.js';
import { Coupon } from '../models/Coupon.js';
import { Subscription } from '../models/Subscription.js';
import { Payment } from '../models/Payment.js';
import { Referral } from '../models/Referral.js';
import { generateReferralCode, generateReceiptNumber } from '../utils/generators.js';
import { addDays, subDays, todayIST } from '../utils/date.js';

export const seedDatabase = async () => {
  console.log('🌱 Starting FitCore Database Seeding...');
  await connectDB();

  const salt = await bcrypt.genSalt(10);
  const adminPassHash = await bcrypt.hash('Admin@123', salt);
  const trainerPassHash = await bcrypt.hash('Trainer@123', salt);
  const memberPassHash = await bcrypt.hash('Member@123', salt);

  // 1. Create/Upsert Admin
  const adminPhone = '+919876543210';
  let admin = await User.findOne({ phone: adminPhone });
  if (!admin) {
    admin = await User.create({
      phone: adminPhone,
      passwordHash: adminPassHash,
      fullName: 'Rajesh Mehra (Admin)',
      email: 'admin@fitcore.in',
      role: 'owner',
      myReferralCode: 'ADMI99X9',
      gymMeta: {
        joinedOn: new Date(2025, 0, 1),
        membershipStatus: 'active',
      },
      isActive: true,
    });
  }

  // 2. Create/Upsert Trainers
  const trainerPhone = '+919876543211';
  let trainer = await User.findOne({ phone: trainerPhone });
  if (!trainer) {
    trainer = await User.create({
      phone: trainerPhone,
      passwordHash: trainerPassHash,
      fullName: 'Vikram Singh (Head Coach)',
      email: 'vikram@fitcore.in',
      role: 'trainer',
      myReferralCode: 'VIKR88K1',
      gymMeta: {
        joinedOn: new Date(2025, 1, 1),
        membershipStatus: 'active',
      },
      isActive: true,
    });
  }

  const trainerPhone2 = '+919876543219';
  let trainer2 = await User.findOne({ phone: trainerPhone2 });
  if (!trainer2) {
    trainer2 = await User.create({
      phone: trainerPhone2,
      passwordHash: trainerPassHash,
      fullName: 'Ananya Roy (Fitness Trainer)',
      email: 'ananya@fitcore.in',
      role: 'trainer',
      myReferralCode: 'ANAN77R2',
      gymMeta: {
        joinedOn: new Date(2025, 2, 1),
        membershipStatus: 'active',
      },
      isActive: true,
    });
  }

  // 3. Create Plans (5 active, 2 inactive)
  const plansData = [
    {
      planName: 'Monthly Starter',
      description: 'Perfect for beginners building a daily workout habit with general floor access.',
      category: 'basic',
      pricePaise: 150000, // ₹1,500
      calendarDays: 30,
      allocatedDays: 26,
      features: ['General Gym Floor Access', 'Locker Room Access', 'Standard Fitness Assessment'],
      isActive: true,
    },
    {
      planName: 'Quarterly Pro',
      description: 'Our most popular quarterly conditioning plan with trainer guidance and cardio zone.',
      category: 'standard',
      pricePaise: 400000, // ₹4,000
      calendarDays: 90,
      allocatedDays: 78,
      features: ['All Starter Features', 'Cardio & Functional Zone', '1 Complimentary Diet Plan', 'Steam Bath Access (Weekly)'],
      isActive: true,
    },
    {
      planName: 'Half-Yearly Elite',
      description: 'Dedicated 6-month body transformation package with dedicated trainer check-ins.',
      category: 'standard',
      pricePaise: 750000, // ₹7,500
      calendarDays: 180,
      allocatedDays: 156,
      features: ['All Pro Features', 'Bi-weekly Body Composition Scan', 'Dedicated Trainer Consultation', 'Free Protein Shake Voucher x2'],
      isActive: true,
    },
    {
      planName: 'Annual VIP All-Access',
      description: 'Unlimited 365-day access to all studio facilities, personal trainer sessions, and sauna.',
      category: 'premium',
      pricePaise: 1399900, // ₹13,999
      calendarDays: 365,
      allocatedDays: 312,
      features: ['Unlimited Gym Floor & Studio', '4 Personal Trainer Sessions', 'Unlimited Sauna & Steam Bath', 'Personal Locker Allocated', 'Complimentary Gym Kit Bag'],
      isActive: true,
    },
    {
      planName: 'Weekend Warrior',
      description: 'Tailored for busy professionals training Friday through Sunday.',
      category: 'basic',
      pricePaise: 120000, // ₹1,200
      calendarDays: 30,
      allocatedDays: 12,
      features: ['Friday to Sunday Access', 'HIIT & Core Floor Access', 'Locker Room'],
      isActive: true,
    },
    {
      planName: 'Early Bird Special (Archived)',
      description: 'Morning 6 AM - 10 AM access tier (discontinued).',
      category: 'basic',
      pricePaise: 99900, // ₹999
      calendarDays: 30,
      allocatedDays: 26,
      features: ['Morning Hours Only'],
      isActive: false,
    },
    {
      planName: 'Student Promo 2025 (Expired)',
      description: 'Discounted student semester access plan.',
      category: 'basic',
      pricePaise: 89900,
      calendarDays: 30,
      allocatedDays: 24,
      features: ['Student ID Required'],
      isActive: false,
    },
  ];

  const seededPlans: any[] = [];
  for (const p of plansData) {
    let plan = await Plan.findOne({ planName: p.planName });
    if (!plan) {
      plan = await Plan.create(p);
    } else {
      Object.assign(plan, p);
      await plan.save();
    }
    seededPlans.push(plan);
  }

  const starterPlan = seededPlans[0];
  const quarterlyPlan = seededPlans[1];
  const annualPlan = seededPlans[3];

  // 4. Create Coupons (5 coupons)
  const couponsData = [
    {
      code: 'FIT50',
      name: '50% Welcome Boost',
      description: 'Get 50% discount up to ₹1,000 on any membership plan.',
      discountType: 'percentage',
      discountValue: 50,
      minPlanPricePaise: 100000,
      maxDiscountPaise: 100000, // Cap ₹1,000
      maxUses: 200,
      currentUses: 12,
      perUserLimit: 1,
      applicableTo: ['all'],
      validFrom: subDays(new Date(), 30),
      validUntil: addDays(new Date(), 90),
      isActive: true,
    },
    {
      code: 'FITTED500',
      name: 'Flat ₹500 Off',
      description: 'Flat ₹500 off on plans above ₹3,000.',
      discountType: 'flat_paise',
      discountValue: 50000, // ₹500
      minPlanPricePaise: 300000,
      maxUses: 100,
      currentUses: 8,
      perUserLimit: 1,
      applicableTo: ['all'],
      validFrom: subDays(new Date(), 15),
      validUntil: addDays(new Date(), 60),
      isActive: true,
    },
    {
      code: 'ANNUALVIP',
      name: 'Annual VIP Flat ₹2,000 Off',
      description: 'Exclusive ₹2,000 discount on Annual VIP membership.',
      discountType: 'flat_paise',
      discountValue: 200000, // ₹2,000
      minPlanPricePaise: 1000000,
      maxUses: 50,
      currentUses: 4,
      perUserLimit: 1,
      applicableTo: [annualPlan._id.toString()],
      validFrom: subDays(new Date(), 20),
      validUntil: addDays(new Date(), 45),
      isActive: true,
    },
    {
      code: 'SUMMER2024',
      name: 'Summer Splash (Expired)',
      description: 'Past seasonal promotion.',
      discountType: 'percentage',
      discountValue: 25,
      minPlanPricePaise: 100000,
      maxUses: 100,
      currentUses: 42,
      perUserLimit: 1,
      applicableTo: ['all'],
      validFrom: subDays(new Date(), 120),
      validUntil: subDays(new Date(), 10), // Expired
      isActive: false,
    },
    {
      code: 'SOLDOUT100',
      name: 'Flash Sale (Exhausted)',
      description: 'Limited flash sale coupon with quota reached.',
      discountType: 'flat_paise',
      discountValue: 30000,
      minPlanPricePaise: 100000,
      maxUses: 5,
      currentUses: 5, // Max uses reached
      perUserLimit: 1,
      applicableTo: ['all'],
      validFrom: subDays(new Date(), 10),
      validUntil: addDays(new Date(), 30),
      isActive: true,
    },
  ];

  for (const c of couponsData) {
    let coupon = await Coupon.findOne({ code: c.code });
    if (!coupon) {
      await Coupon.create(c);
    } else {
      Object.assign(coupon, c);
      await coupon.save();
    }
  }

  // 5. Create Demo Primary Member: Priya Patel
  const primaryMemberPhone = '+919876543212';
  let primaryMember = await User.findOne({ phone: primaryMemberPhone });
  if (!primaryMember) {
    primaryMember = await User.create({
      phone: primaryMemberPhone,
      passwordHash: memberPassHash,
      fullName: 'Priya Patel',
      email: 'priya.patel@gmail.com',
      role: 'member',
      myReferralCode: 'PRIY49B2',
      loyaltyPoints: 1000,
      profile: {
        dob: new Date('1997-06-15'),
        gender: 'female',
        bloodGroup: 'B+',
        address: {
          street: '402, Green Avenue, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560038',
        },
      },
      gymMeta: {
        joinedOn: subDays(new Date(), 60),
        membershipStatus: 'active',
        assignedTrainer: trainer._id,
      },
      isActive: true,
    });

    await Referral.create({
      referrer: primaryMember._id,
      referralCode: 'PRIY49B2',
      totalReferrals: 2,
      successfulConversions: 2,
    });
  }

  // Create Active Subscription for Priya Patel
  let priyaSub = await Subscription.findOne({ user: primaryMember._id, status: 'active' });
  if (!priyaSub) {
    const payment = await Payment.create({
      user: primaryMember._id,
      plan: quarterlyPlan._id,
      receiptNumber: generateReceiptNumber(),
      amountPaise: quarterlyPlan.pricePaise,
      discountPaise: 50000,
      finalAmountPaise: 350000,
      paymentMethod: 'razorpay',
      status: 'success',
      gatewayOrderId: 'order_seed_priya',
      couponDetails: { code: 'FITTED500', discountPaise: 50000 },
    });

    const startsOn = subDays(new Date(), 14);
    const expiresOn = addDays(startsOn, quarterlyPlan.calendarDays);

    // Realistic attendance log for past 14 days
    const attendanceLog: any[] = [];
    for (let i = 13; i >= 1; i -= 2) {
      const checkInDate = subDays(new Date(), i);
      attendanceLog.push({
        date: todayIST(checkInDate),
        checkInTime: checkInDate,
        markedBy: trainer._id,
      });
    }

    priyaSub = await Subscription.create({
      user: primaryMember._id,
      plan: quarterlyPlan._id,
      payment: payment._id,
      planSnapshot: {
        planName: quarterlyPlan.planName,
        pricePaise: quarterlyPlan.pricePaise,
        allocatedDays: quarterlyPlan.allocatedDays,
        calendarDays: quarterlyPlan.calendarDays,
        features: quarterlyPlan.features,
      },
      status: 'active',
      allocatedDays: quarterlyPlan.allocatedDays,
      daysUsed: attendanceLog.length,
      daysRemaining: quarterlyPlan.allocatedDays - attendanceLog.length,
      startsOn,
      expiresOn,
      attendanceLog,
    });

    primaryMember.activeSubscription = priyaSub._id as any;
    primaryMember.gymMeta.membershipStatus = 'active';
    await primaryMember.save();
  }

  // 6. Create 10 Additional Realistic Members with varied history across last 6 months
  const demoMembers = [
    { name: 'Arun Kumar', phone: '+919876543220', email: 'arun.k@gmail.com', daysAgo: 120, plan: quarterlyPlan, status: 'active', daysLeft: 42, used: 36, trainer: trainer },
    { name: 'Sneha Deshmukh', phone: '+919876543221', email: 'sneha.d@gmail.com', daysAgo: 45, plan: starterPlan, status: 'expired', daysLeft: 0, used: 26, trainer: trainer2 },
    { name: 'Rohan Verma', phone: '+919876543222', email: 'rohan.v@gmail.com', daysAgo: 5, plan: starterPlan, status: 'active', daysLeft: 23, used: 3, trainer: trainer },
    { name: 'Kavita Nair', phone: '+919876543223', email: 'kavita.n@outlook.com', daysAgo: 175, plan: annualPlan, status: 'active', daysLeft: 190, used: 122, trainer: trainer2 },
    { name: 'Amitabh Joshi', phone: '+919876543224', email: 'amitabh.j@gmail.com', daysAgo: 28, plan: starterPlan, status: 'active', daysLeft: 2, used: 24, trainer: trainer }, // Expiring in 2 days!
    { name: 'Divya Iyer', phone: '+919876543225', email: 'divya.iyer@gmail.com', daysAgo: 10, plan: starterPlan, status: 'active', daysLeft: 20, used: 6, trainer: trainer2 },
    { name: 'Siddharth Rao', phone: '+919876543226', email: 'sid.rao@gmail.com', daysAgo: 90, plan: quarterlyPlan, status: 'expired', daysLeft: 0, used: 78, trainer: trainer },
    { name: 'Pooja Hegde', phone: '+919876543227', email: 'pooja.h@gmail.com', daysAgo: 26, plan: starterPlan, status: 'active', daysLeft: 4, used: 22, trainer: trainer2 }, // Expiring in 4 days!
    { name: 'Manish Pandey', phone: '+919876543228', email: 'manish.p@gmail.com', daysAgo: 60, plan: quarterlyPlan, status: 'active', daysLeft: 30, used: 48, trainer: trainer },
    { name: 'Neha Gupta', phone: '+919876543229', email: 'neha.g@gmail.com', daysAgo: 15, plan: starterPlan, status: 'active', daysLeft: 15, used: 11, trainer: trainer2 },
  ];

  for (const m of demoMembers) {
    let member = await User.findOne({ phone: m.phone });
    if (!member) {
      const refCode = generateReferralCode(m.name);
      member = await User.create({
        phone: m.phone,
        passwordHash: memberPassHash,
        fullName: m.name,
        email: m.email,
        role: 'member',
        myReferralCode: refCode,
        referredByCode: 'PRIY49B2', // Referred by Priya Patel
        gymMeta: {
          joinedOn: subDays(new Date(), m.daysAgo),
          membershipStatus: m.status as any,
          assignedTrainer: m.trainer._id,
        },
        isActive: true,
      });

      await Referral.create({
        referrer: member._id,
        referralCode: refCode,
        referredMembers: [],
      });

      // Create Payment
      const receipt = generateReceiptNumber();
      const paymentDate = subDays(new Date(), m.daysAgo);
      const payment = await Payment.create({
        user: member._id,
        plan: m.plan._id,
        receiptNumber: receipt,
        amountPaise: m.plan.pricePaise,
        discountPaise: 0,
        finalAmountPaise: m.plan.pricePaise,
        paymentMethod: ['razorpay', 'upi', 'cash'][Math.floor(Math.random() * 3)] as any,
        status: 'success',
        gatewayOrderId: `order_${receipt}`,
        createdAt: paymentDate,
        updatedAt: paymentDate,
      });

      // Attendance history
      const attendanceLog: any[] = [];
      const totalVisits = m.used;
      for (let v = 0; v < totalVisits; v++) {
        const visitDate = subDays(new Date(), Math.min(m.daysAgo - 1, Math.max(1, v * 2)));
        attendanceLog.push({
          date: todayIST(visitDate),
          checkInTime: visitDate,
          markedBy: m.trainer._id,
        });
      }

      // Check-in today for first 3 members to have live dashboard data
      if (['+919876543220', '+919876543222', '+919876543224'].includes(m.phone)) {
        attendanceLog.push({
          date: todayIST(),
          checkInTime: new Date(),
          markedBy: trainer._id,
        });
      }

      const startsOn = subDays(new Date(), m.daysAgo);
      const expiresOn = addDays(startsOn, m.plan.calendarDays);

      const sub = await Subscription.create({
        user: member._id,
        plan: m.plan._id,
        payment: payment._id,
        planSnapshot: {
          planName: m.plan.planName,
          pricePaise: m.plan.pricePaise,
          allocatedDays: m.plan.allocatedDays,
          calendarDays: m.plan.calendarDays,
          features: m.plan.features,
        },
        status: m.status as any,
        allocatedDays: m.plan.allocatedDays,
        daysUsed: m.used,
        daysRemaining: m.daysLeft,
        startsOn,
        expiresOn,
        attendanceLog,
      });

      if (m.status === 'active') {
        member.activeSubscription = sub._id as any;
        await member.save();
      }
    }
  }

  // Update Priya's referral document with referee conversions
  await Referral.findOneAndUpdate(
    { referralCode: 'PRIY49B2' },
    {
      totalReferrals: 2,
      successfulConversions: 2,
      referredMembers: [
        {
          user: demoMembers[0].phone ? (await User.findOne({ phone: demoMembers[0].phone }))?._id : null,
          fullName: demoMembers[0].name,
          joinedOn: subDays(new Date(), 120),
          hasPurchased: true,
          rewardIssued: true,
        },
        {
          user: demoMembers[1].phone ? (await User.findOne({ phone: demoMembers[1].phone }))?._id : null,
          fullName: demoMembers[1].name,
          joinedOn: subDays(new Date(), 45),
          hasPurchased: true,
          rewardIssued: true,
        },
      ],
    }
  );

  console.log('\n========================================================');
  console.log('🎉 FitCore Seed Data Successfully Populated!');
  console.log('========================================================');
  console.log('🔐 Development Credentials:');
  console.log('1. Admin (Owner):');
  console.log('   Phone:    +919876543210 (or 9876543210)');
  console.log('   Password: Admin@123');
  console.log('2. Head Trainer:');
  console.log('   Phone:    +919876543211 (or 9876543211)');
  console.log('   Password: Trainer@123');
  console.log('3. Member (Priya Patel):');
  console.log('   Phone:    +919876543212 (or 9876543212)');
  console.log('   Password: Member@123');
  console.log('   Referral: PRIY49B2');
  console.log('========================================================\n');

  await disconnectDB();
};

if (process.argv[1]?.includes('seed.ts') || process.argv[1]?.includes('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding error:', err);
      process.exit(1);
    });
}
