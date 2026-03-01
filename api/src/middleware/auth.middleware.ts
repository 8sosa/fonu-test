import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend the Express Request type so TypeScript knows req.user exists
export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: No token provided' });
    return; // Stop execution
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string; role: string };
    req.user = decoded; // Attach the user info to the request
    next(); // Pass control to the next function (the controller)
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};