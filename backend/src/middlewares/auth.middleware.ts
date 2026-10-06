import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { firebaseAdmin, hasFirebaseKey } from '../services/firebase.service';

export const JWT_SECRET = process.env.JWT_SECRET || 'multiuser-dev-jwt-secret-2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role: string;
  };
}

export async function firebaseAuthMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided. Authorization header required.' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    if (hasFirebaseKey) {
      const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);
      req.user = {
        uid: decoded.uid,
        email: decoded.email,
        role: (decoded as any).role || 'CLIENTE'
      };
    } else {
      const decoded = jwt.verify(idToken, JWT_SECRET) as any;
      req.user = {
        uid: decoded.uid || decoded.id,
        email: decoded.email,
        role: decoded.role || 'CLIENTE'
      };
    }
    next();
  } catch (error: any) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

