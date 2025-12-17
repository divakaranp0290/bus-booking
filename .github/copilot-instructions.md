# Bus Booking Platform - AI Coding Guidelines

## Architecture Overview

This is a full-stack ticket booking system with **decoupled frontend and backend**:
- **Backend**: Express.js + TypeScript + Prisma ORM + PostgreSQL
- **Frontend**: Angular 17 + RxJS with standalone components
- **Key integrations**: Redis (distributed seat locks), Razorpay (payments), JWT auth

### Data Flow
1. **User Authentication** → `POST /api/auth/login` → JWT token stored in `localStorage`
2. **Seat Locking** → `POST /api/booking/lock` → Redis + DB dual-write (SeatLock model)
3. **Payment** → Razorpay order → `POST /api/booking/confirm` with signature verification
4. **Booking Confirmation** → Atomic state transition (LOCKED → PAYMENT_SUCCESS → CONFIRMED)

## Project Structure

```
backend/src/
├── routes/          # Express route handlers (auth, booking, user)
├── middleware/      # JWT auth.ts (all protected routes need authMiddleware)
├── utils/
│   ├── prisma.ts    # Prisma client singleton
│   ├── redislock.ts # Distributed seat locking via Redis
│   ├── razorpay.ts  # Razorpay instance initialization
│   ├── auth.ts      # JWT sign/verify, password hashing
│   └── otp.ts       # OTP generation and email
├── controllers/     # (empty - logic in routes for now)
├── seed.ts          # Database seeding
└── server.ts        # App initialization and CORS setup

frontend/src/app/
├── core/            # Services: auth, api, booking (injected singletons)
├── auth/            # Login, signup, forgot-password components
├── booking/         # Bus detail, seat selection, success pages
└── app.routes.ts    # AuthGuard applied to /user/* and /booking/*
```

## Critical Patterns & Conventions

### 1. **Distributed Seat Locking** (backend/src/utils/redislock.ts)
- Uses Redis `SET key value PX ttlMs NX` (NX = fail if exists) for optimistic locking
- Dual-write: Redis (fast TTL) + PostgreSQL SeatLock (audit + fallback)
- Lock release uses Lua script to ensure atomic token verification
- **Key pattern**: `seatlock:{busId}:{seatNo}` with UUID token
- Always check existing locks before creating booking: `SeatLock.findMany({ expiresAt: { gt: now } })`

### 2. **Booking State Machine** (backend/src/routes/booking.ts)
- **INITIATED** → **LOCKED** → **PAYMENT_PENDING** → **PAYMENT_SUCCESS** → **CONFIRMED**
- `lockRef` (UUID) links Booking ↔ SeatLock rows (unique constraint on both)
- Rollback pattern: On lock failure, delete booking + release Redis seats + clean SeatLock rows
- Payment status stored separately in one-to-one Payment relation (bookingId unique)

### 3. **Frontend Service Layer** (frontend/src/app/core/)
- **ApiService**: Base HTTP wrapper (`get`, `post`, `postForm`) with `environment.apiBase`
- **BookingService**: Wraps API calls for seat locks, payment creation, confirmation
- **AuthService**: Stores JWT in `localStorage.token`, provides `getToken()`, signup/login with auto-save
- All services use `@Injectable({ providedIn: 'root' })` (tree-shakable)

### 4. **JWT Authentication** (backend + frontend)
- Backend: `verifyJwt(token)` returns payload with `userId`, `role`
- Frontend: `AuthGuard` checks `localStorage.token` before allowing protected routes
- Token format: `Authorization: Bearer <token>` (extracted in authMiddleware)
- Routes path `/user/*` and `/booking/*` protected; auth routes public

### 5. **Express Validation Pattern** (backend/src/routes/auth.ts)
- Use `express-validator` chain: `body('email').isEmail()`, then `validationResult(req)`
- Return 400 + error array if validation fails
- Example: `router.post('/signup', [body('email').isEmail(), body('password').isLength({min: 6})], handler)`

### 6. **Razorpay Integration** (backend/src/utils/razorpay.ts)
- Razorpay instance: `new Razorpay({ key_id, key_secret })` from env vars
- Payment workflow: Create order → signature verification → store razorpayPaymentId/Signature
- Signature verification: `crypto.createHmacSha256(order_id + "|" + payment_id, secret).update().digest('hex') === signature`

### 7. **Database Schema Conventions** (backend/prisma/schema.prisma)
- One-to-many: User ↔ Booking (foreign key); Booking ↔ BookingSeat (cascading)
- One-to-one: Booking ↔ Payment (Payment.bookingId unique)
- Enums: UserRole (USER, ADMIN, PROVIDER), BookingStatus, PaymentStatus
- Timestamps: Always include `createdAt`, `updatedAt` on transactional models
- Unique constraints: User.email, Booking.pnr, Booking.lockRef, SeatLock(busId, seatNo)

## Development Workflows

### Backend Setup
```bash
cd backend
npm install
# Configure .env: DATABASE_URL, REDIS_URL, JWT_SECRET, RAZORPAY_KEY_*
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Create tables
npm run seed               # Populate test data
npm run dev                # Watch mode with ts-node (port 3000)
```

### Frontend Setup
```bash
cd frontend
npm install
npm start                  # ng serve (port 4200)
npm run build:prod         # Production build → dist/frontend
```

### Key Commands
- **Prisma studio**: `npm run prisma:studio` (visual DB editor on localhost:5555)
- **Test frontend**: `ng test` (uses Vitest)
- **Type generation**: Backend generates types in `src/generated/` from Prisma schema

## Common Implementation Tasks

### Adding a new protected booking API endpoint
1. Define Prisma model relation in `schema.prisma` (if new entity)
2. Create route handler in `backend/src/routes/booking.ts`
3. Apply `authMiddleware` to protect the route
4. Use `validationResult()` for input validation
5. Return consistent JSON: `{ success: true, data: {...} }` or `{ error: 'message' }`
6. Create corresponding method in `BookingService` in frontend
7. Call from component via `this.bookingService.method().subscribe(...)`

### Handling seat lock race conditions
- Always use Redis as source of truth for real-time locks (DB is audit log)
- Rollback is transactional: delete booking → delete SeatLock rows → release Redis locks
- Implement exponential backoff on UI if lock fails (user retry, not auto-retry)

### Database migrations
```bash
cd backend
npx prisma migrate dev --name <migration_name>
```
Generates timestamped migration SQL in `prisma/migrations/` for version control.

## Environment Variables (Required)

**Backend** (.env):
```
DATABASE_URL=postgresql://user:password@localhost:5432/bus_booking
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_secret
PORT=3000
```

**Frontend** (src/environments/environment.ts):
- `apiBase`: Backend API URL (e.g., `http://localhost:3000/api`)
- Separate prod config in `environment.prod.ts`

## Testing & Debugging Tips

- Use Prisma Studio (`prisma:studio`) to inspect DB state during development
- Check Redis locks with `redis-cli`: `KEYS seatlock:*`, `GET seatlock:busId:seat`
- Verify JWT tokens at [jwt.io](https://jwt.io)
- Frontend: Open DevTools → Application → Local Storage to inspect `token`
- Log request IDs in booking endpoints for tracing multi-step operations
