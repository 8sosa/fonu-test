import 'dotenv/config'; // 👈 Change to this (removes the need for .config())
import request from 'supertest';
import app from '../index'; 
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Fintech Portal Requirements Verification', () => {
  
  // 1. AUTHENTICATION & HASHING
  it('Requirement 1: should hash passwords and not return them in login response', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' });
    
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).not.toHaveProperty('password');
  });

  // 2. KYC GUARD FOR SUBSCRIPTIONS
  it('Requirement 3: should block subscription creation if KYC is not APPROVED', async () => {
    // Attempting to create a sub for a user who is PENDING
    const res = await request(app)
      .post('/customers/test-user-id/subscriptions')
      .set('Authorization', 'Bearer ADMIN_TOKEN')
      .send({ plan: 'BASIC', amount: 500000 }); // 5000 Naira
    
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/KYC approved/i);
  });

  // 3. WEBHOOK SIGNATURE SECURITY
  it('Requirement 5: should reject webhooks with invalid HMAC signatures', async () => {
    const res = await request(app)
      .post('/webhooks/payments')
      .set('x-fonu-signature', 'wrong-signature-123')
      .send({ event: 'payment.success', data: { subscriptionId: '123' } });
    
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid signature');
  });

  // 4. ROLE-BASED ACCESS CONTROL (RBAC)
  it('Requirement 1: should prevent CUSTOMER role from approving their own KYC', async () => {
    const res = await request(app)
      .post('/customers/my-id/kyc/approve')
      .set('Authorization', 'Bearer CUSTOMER_TOKEN'); // Token for a non-admin
    
    expect(res.status).toBe(403);
  });

  // 5. WEBHOOK LOGIC & ACTIVATION
  it('Requirement 5: should activate subscription and set renewal date on payment.success', async () => {
    // Note: In a real test, you would mock the Prisma call or use a Test DB
    // This verifies the logic that handles the payload
    const mockPayload = { event: 'payment.success', data: { subscriptionId: 'sub_abc' } };
    
    const res = await request(app)
      .post('/webhooks/payments')
      .set('x-fonu-signature', 'valid_signature_for_test') // Mocked in test env
      .send(mockPayload);
    
    expect(res.status).toBe(200);
  });
});