import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { firebaseAdmin, hasFirebaseKey } from '../services/firebase.service';
import { JWT_SECRET } from '../middlewares/auth.middleware';
import { prisma } from '../prisma/client';
import { sendWelcomeEmail } from '../services/email.service';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    if (hasFirebaseKey) {
      const userRecord = await firebaseAdmin.auth().getUserByEmail(email);
      const dbUser = await prisma.user.findUnique({ where: { email } });
      const role = dbUser?.role || 'CLIENTE';
      const customToken = await firebaseAdmin.auth().createCustomToken(userRecord.uid, { role });
      return res.json({ token: customToken, user: { id: userRecord.uid, uid: userRecord.uid, email, role } });
    }

    // Local dev mode without Firebase service key
    const dbUser = await prisma.user.findUnique({ where: { email } });
    if (!dbUser) {
      return res.status(401).json({ error: 'Credenciales inválidas o usuario no registrado' });
    }

    const token = jwt.sign(
      { uid: dbUser.id, email: dbUser.email, role: dbUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ token, user: { id: dbUser.id, uid: dbUser.id, email: dbUser.email, role: dbUser.role, displayName: dbUser.displayName } });
  } catch (error: any) {
    return res.status(401).json({ error: 'Credenciales inválidas o usuario no registrado', details: error.message });
  }
};

export const register = async (req: Request, res: Response) => {
  const { email, password, displayName, role } = req.body;
  try {
    const assignedRole = role === 'ADMIN' ? 'ADMIN' : 'CLIENTE';

    if (hasFirebaseKey) {
      const userRecord = await firebaseAdmin.auth().createUser({
        email,
        password,
        displayName,
      });

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

      // Enviar correo de bienvenida
      sendWelcomeEmail(email, displayName || email.split('@')[0], assignedRole).catch(err => {
        console.error('Error enviando email:', err);
      });

      return res.status(201).json({ token: customToken, user });
    }

    // Local dev mode without Firebase service key
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }

    const userId = randomUUID();
    const user = await prisma.user.create({
      data: {
        id: userId,
        email,
        displayName: displayName || email.split('@')[0],
        role: assignedRole
      }
    });

    const token = jwt.sign(
      { uid: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Enviar correo de bienvenida
    sendWelcomeEmail(email, displayName || email.split('@')[0], assignedRole).catch(err => {
      console.error('Error enviando email:', err);
    });

    return res.status(201).json({ token, user });
  } catch (error: any) {
    return res.status(400).json({ error: 'Fallo al registrar usuario', details: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, newPassword } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'El correo electrónico es requerido' });
  }

  try {
    const dbUser = await prisma.user.findUnique({ where: { email } });
    if (!dbUser) {
      return res.status(404).json({ error: 'No existe una cuenta registrada con este correo electrónico' });
    }

    if (hasFirebaseKey) {
      const userRecord = await firebaseAdmin.auth().getUserByEmail(email);
      if (newPassword) {
        await firebaseAdmin.auth().updateUser(userRecord.uid, { password: newPassword });
      }
    }

    return res.json({
      message: `Se ha enviado la instrucción de restauración al correo ${email}. Si deseas ingresar directamente en demostración, tu clave ha sido actualizada.`
    });
  } catch (error: any) {
    return res.status(400).json({ error: 'Error al procesar la restauración de contraseña', details: error.message });
  }
};



