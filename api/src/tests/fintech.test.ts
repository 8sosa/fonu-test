import 'dotenv/config';
import request from 'supertest';
import app from '../index'; 
import prisma from '../db';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

describe('Fintech Portal Requirements Verification', () => {
  let adminToken: string;
  let customerToken: string;
  let testCustomerId: string;
  
  const testAdminEmail = 'test@fonu.com';
  const testUserEmail = 'user@fonu.com';
  const webhookSecret = process.env.WEBHOOK_SECRET || 'fonu_secret_123';

  // 1. THE NUKE: Clears all data to ensure a "Clean Slate"
  async function clearDatabase() {
    // Get all table names in the public schema
    const tablenames = await prisma.$queryRawUnsafe<Array<{ tablename: string }>>(
      `SELECT tablename FROM pg_tables WHERE schemaname='public'`
    );

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== '_prisma_migrations')
      .map((name) => `"public"."${name}"`)
      .join(', ');

    if (tables) {
      // CASCADE ensures that dependent rows (like KycRecords) are wiped with Users
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    }
  }

  beforeAll(async () => {
    await clearDatabase();

    // 2. SEED ADMIN: Matches your User model fields (email, password, role, name)
    const hashedAdminPassword = await bcrypt.hash('password123', 10);
    await prisma.user.create({
      data: {
        email: testAdminEmail,
        password: hashedAdminPassword,
        role: 'ADMIN',
        name: 'Test Admin'
      }
    });

    // 3. SEED CUSTOMER: Matches your User model and KycRecord relation name
    const hashedUserPassword = await bcrypt.hash('password123', 10);
    const customer = await prisma.user.create({
      data: {
        email: testUserEmail,
        password: hashedUserPassword,
        role: 'USER',
        name: 'Test Customer',
        kyc: {
          create: { 
            status: 'PENDING',
            documentType: 'NIN',
            documentNumber: '123456789'
          } 
        }
      }
    });
    testCustomerId = customer.id;

    // 4. GET TOKENS
    const adminLogin = await request(app)
      .post('/auth/login')
      .send({ email: testAdminEmail, password: 'password123' });
    adminToken = adminLogin.body.token;

    const customerLogin = await request(app)
      .post('/auth/login')
      .send({ email: testUserEmail, password: 'password123' });
    customerToken = customerLogin.body.token;
  });

  // REQUIREMENT 1: AUTHENTICATION
  it('Requirement 1: should hash passwords and not return them in login response', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: testAdminEmail, password: 'password123' });
    
    expect(res.status).toBe(200);
    expect(res.body.user).not.toHaveProperty('password');
  });

  // REQUIREMENT 3: KYC GUARD
  it('Requirement 3: should block subscription creation if KYC is not APPROVED', async () => {
    const res = await request(app)
      .post(`/customers/${testCustomerId}/subscriptions`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ plan: 'BASIC', amount: 500000 });
    
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/KYC/i);
  });

  // REQUIREMENT 5: WEBHOOK SECURITY
  it('Requirement 5: should reject webhooks with invalid HMAC signatures', async () => {
    const res = await request(app)
      .post('/webhooks/payments')
      .set('x-fonu-signature', 'wrong-signature-123')
      .send({ event: 'payment.success', data: { subscriptionId: 'some-id' } });
    
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid signature');
  });

  // REQUIREMENT 1: RBAC
  it('Requirement 1: should prevent CUSTOMER role from approving their own KYC', async () => {
    // This assumes your endpoint is /customers/:id/kyc/approve
    const res = await request(app)
      .post(`/customers/${testCustomerId}/kyc/approve`)
      .set('Authorization', `Bearer ${customerToken}`);
    
    expect(res.status).toBe(403);
  });

  // REQUIREMENT 5: WEBHOOK ACTIVATION
  it('Requirement 5: should activate subscription on payment.success', async () => {
    // 1. Manually set KYC to APPROVED so the system allows sub creation
    await prisma.kycRecord.update({
      where: { userId: testCustomerId },
      data: { status: 'APPROVED' }
    });

    // 2. Create the inactive subscription
    const testSub = await prisma.subscription.create({
      data: {
        userId: testCustomerId,
        plan: 'BASIC',
        amount: 500000,
        status: 'INACTIVE'
      }
    });

    const mockPayload = { 
      event: 'payment.success', 
      data: { subscriptionId: testSub.id } 
    };
    
    const payloadString = JSON.stringify(mockPayload);
    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payloadString)
      .digest('hex');

    const res = await request(app)
      .post('/webhooks/payments')
      .set('x-fonu-signature', signature)
      .send(mockPayload);
    
    expect(res.status).toBe(200);

    // 3. Verify Database State
    const updatedSub = await prisma.subscription.findUnique({ where: { id: testSub.id } });
    expect(updatedSub?.status).toBe('ACTIVE');
    expect(updatedSub?.renewalDate).toBeDefined();
  });
});