import { Request, Response } from 'express';
import { firebaseAdmin } from '../services/firebase.service';
import { prisma } from '../prisma/client';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const userRecord = await firebaseAdmin.auth().getUserByEmail(email);
    const dbUser = await prisma.user.findUnique({ where: { email } });

    const role = dbUser?.role || 'CLIENTE';

    const customToken = await firebaseAdmin.auth().createCustomToken(userRecord.uid, { role });
    res.json({ token: customToken, user: { uid: userRecord.uid, email, role } });
  } catch (error: any) {
    res.status(401).json({ error: 'Credenciales inválidas o usuario no registrado', details: error.message });
  }
};

export const register = async (req: Request, res: Response) => {
  const { email, password, displayName, role } = req.body;
  try {
    const userRecord = await firebaseAdmin.auth().createUser({
      email,
      password,
      displayName,
    });

    const assignedRole = role === 'ADMIN' ? 'ADMIN' : 'CLIENTE';

    await firebaseAdmin.auth().setCustomUserClaims(userRecord.uid, { role: assignedRole });

    const user = await prisma.user.create({
      data: {
        id: userRecord.uid,
        email,
        displayName: displayName || email.split('@')[0],
        role: assignedRole
      }
    });

    const customToken = await firebaseAdmin.auth().createCustomToken(userRecord.uid, { role: assignedRole });

    res.status(201).json({ token: customToken, user });
  } catch (error: any) {
    res.status(400).json({ error: 'Fallo al registrar usuario', details: error.message });
  }
};
