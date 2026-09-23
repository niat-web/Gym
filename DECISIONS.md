# FitCore Architectural & Design Decisions (DECISIONS.md)

This log records all technical and design decisions made during the development of FitCore to ensure consistency, security, and maintainability.

---

## 1. Monetary Values & Financial Storage
- **Decision**: All financial fields (`pricePaise`, `amountPaise`, `discountPaise`, `finalAmountPaise`, etc.) are strictly stored as integer paise (1 INR = 100 paise).
- **Rationale**: Storing currency as integers completely avoids JavaScript floating-point rounding inaccuracies (e.g. `0.1 + 0.2 !== 0.3`). Currency formatting to `₹X,XXX` is performed exclusively on the presentation layer.

## 2. Role Representation
- **Decision**: Roles are strictly persisted in MongoDB as `owner`, `trainer`, and `member`.
- **UI Presentation**: The `owner` role is always displayed and labeled as **"Admin"** throughout the user interface, while internal backend auth middlewares check against `owner`.

## 3. Atomic Attendance & Quota Tracking
- **Decision**: Check-ins utilize MongoDB's conditional `findOneAndUpdate` with `'attendanceLog.date': { $ne: today }` and atomic `$inc: { daysUsed: 1, daysRemaining: -1 }` with `$push`.
- **Rationale**: Prevents race conditions from simultaneous requests/double-taps at the front desk, ensuring a member can never have their quota deducted twice on the same calendar day (Asia/Kolkata timezone).

## 4. Idempotent Payment Verification
- **Decision**: Payment verification atomically queries `Payment.findOneAndUpdate({ _id, status: 'pending' }, { status: 'success', ... })` inside a session/atomic flow.
- **Rationale**: Ensures duplicate or concurrent verification calls for the same gateway order return the existing payment and never spawn duplicate subscriptions or double-issue referral bonuses.

## 5. Mock vs Real Payment Gateway
- **Decision**: By default, `PAYMENTS_MODE=mock` (or placeholder keys starting with `rzp_test_xxxx`) enables the built-in interactive Mock Payment sheet on the frontend.
- **Rationale**: Allows 100% offline and hassle-free end-to-end testing, while maintaining full SDK parity and HMAC signature validation when production Razorpay credentials are supplied.

## 6. Referral Anti-Abuse & Single Conversion
- **Decision**: Referral rewards (₹200 discount for referee on first purchase, +500 loyalty points for referrer) are gated by checking `priorSuccessfulPaymentsCount === 0` and atomically executing positional updates `{ 'referredMembers.user': refereeId, 'referredMembers.rewardIssued': false }`.
- **Rationale**: Guarantees that referral discounts apply strictly to first-time buyers and points are credited to the referrer exactly once per invited member.

## 7. Timezone Standard: Asia/Kolkata
- **Decision**: The entire system utilizes `Asia/Kolkata` (+05:30) as the source of truth for check-ins, attendance calendar, and midnight cron jobs.
- **Rationale**: As FitCore is designed for Indian gyms and studios, all daily limits, expiry dates, and cron triggers must align with the gym's physical operational day.

## 8. State Management & Data Fetching
- **Decision**: TanStack Query (React Query) handles server state caching, background invalidation, and optimistic UI updates. Zustand manages client-side authentication and theme preferences.
- **Rationale**: Separates server cache from client UI state, providing instant responsiveness, automatic cache invalidation upon check-ins/payments, and clean state restoration.
