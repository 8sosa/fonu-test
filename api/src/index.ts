import 'dotenv/config';
import express from 'express';
import prisma from './db';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import customerRoutes from './routes/customer.routes';
import { handlePaymentWebhook } from './controllers/webhook.controller';
import { authorize } from './middleware/role.middleware';
import webhookRoutes from './routes/webhook.routes';

const app = express();
const port = process.env.PORT || 3000;

// 1. The Bouncer: Allow the frontend in
app.use(cors({
  origin: 'http://localhost:5173'
}));

// 2. Body Parser: CRITICAL for reading emails/passwords from req.body
app.use(express.json()); 

// 3. Simple Health Check
app.get('/health', async (req, res) => {
  try {
    // This executes a simple query to ensure the DB connection is alive
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: "Healthy", 
      database: "Connected",
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    // Check if error is an actual Error object
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    
    res.status(500).json({ 
      status: "Unhealthy", 
      error: errorMessage 
    });
  }
});

// 4. Mount our API Routes
// This means every route inside auth.routes.ts will automatically start with /auth
// Example: router.post('/login') becomes POST http://localhost:3000/auth/login
app.use('/auth', authRoutes);
app.use('/customers', customerRoutes);
app.post('/webhooks/payments', handlePaymentWebhook);
app.use('/webhooks', webhookRoutes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
  });
}

export default app;