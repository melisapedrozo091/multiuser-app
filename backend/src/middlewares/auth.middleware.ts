import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { firebaseAdmin, hasFirebaseKey } from '../services/firebase.service';

export const JWT_SECRET = process.env.JWT_SECRET || 'multiuser-dev-jwt-secret-2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    displayName?: string;
    name?: string;
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
    let verified = false;

    // 1. Try Firebase Token if key is present
    if (hasFirebaseKey) {
      try {
        const decoded = await firebaseAdmin.auth().verifyIdToken(idToken);
        req.user = {
          uid: decoded.uid,
          email: decoded.email,
          displayName: decoded.name,
          name: decoded.name,
          role: (decoded as any).role || 'CLIENTE'
        };
        verified = true;
      } catch (fbTokenErr) {
        // Fall through to JWT verification below
      }
    }

    // 2. Try Local JWT Token
    if (!verified) {
      try {
        const decoded = jwt.verify(idToken, JWT_SECRET) as any;
        req.user = {
          uid: decoded.uid || decoded.id,
          email: decoded.email,
          displayName: decoded.name || decoded.displayName,
          name: decoded.name || decoded.displayName,
          role: decoded.role || 'CLIENTE'
        };
        verified = true;
      } catch (jwtErr) {
        // Neither verified
      }
    }

    if (!verified) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    next();
  } catch (error: any) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

