import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { firebaseAdmin, hasFirebaseKey } from '../services/firebase.service';
import { JWT_SECRET, AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../prisma/client';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../services/email.service';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    if (hasFirebaseKey) {
      const userRecord = await firebaseAdmin.auth().getUserByEmail(email);
      const dbUser = await prisma.user.findUnique({ where: { email } });
      const role = dbUser?.role || 'CLIENTE';
      const customToken = await firebaseAdmin.auth().createCustomToken(userRecord.uid, { role });
      return res.json({ token: customToken, user: { id: userRecord.uid, uid: userRecord.uid, email, role, displayName: dbUser?.displayName } });
    }

    // Local dev mode without Firebase service key
    const dbUser = await prisma.user.findUnique({ where: { email } });
    if (!dbUser) {
      return res.status(401).json({ error: 'Credenciales inválidas o usuario no registrado' });
    }

    // Verify stored password if set
    if (dbUser.password && dbUser.password !== password) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { uid: dbUser.id, email: dbUser.email, role: dbUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: { id: dbUser.id, uid: dbUser.id, email: dbUser.email, role: dbUser.role, displayName: dbUser.displayName }
    });
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
          password,
          displayName: displayName || email.split('@')[0],
          role: assignedRole
        }
      });

      const customToken = await firebaseAdmin.auth().createCustomToken(userRecord.uid, { role: assignedRole });

      sendWelcomeEmail(email, displayName || email.split('@')[0], assignedRole).catch(err => {
        console.error('Error enviando email:', err);
      });

      return res.status(201).json({ token: customToken, user });
    }

    // Local dev mode
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }

    const userId = randomUUID();
    const user = await prisma.user.create({
      data: {
        id: userId,
        email,
        password,
        displayName: displayName || email.split('@')[0],
        role: assignedRole
      }
    });

    const token = jwt.sign(
      { uid: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    sendWelcomeEmail(email, displayName || email.split('@')[0], assignedRole).catch(err => {
      console.error('Error enviando email:', err);
    });

    return res.status(201).json({ token, user });
  } catch (error: any) {
    return res.status(400).json({ error: 'Fallo al registrar usuario', details: error.message });
  }
};

// STEP 1: Request 6-digit verification code sent via email
export const requestResetCode = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'El correo electrónico es requerido' });
  }

  try {
    const dbUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!dbUser) {
      return res.status(404).json({ error: 'No existe una cuenta registrada con este correo electrónico' });
    }

    // Generate 6-digit security code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins validity

    await prisma.user.update({
      where: { id: dbUser.id },
      data: { resetCode, resetCodeExpires }
    });

    // Send email with reset code
    sendPasswordResetEmail(dbUser.email, dbUser.displayName || dbUser.email.split('@')[0], resetCode).catch(err => {
      console.error('Error enviando email de recuperación:', err);
    });

    return res.json({
      message: `Hemos enviado un código de verificación de 6 dígitos al correo ${dbUser.email}. Ingrésalo para definir tu nueva contraseña.`
    });
  } catch (error: any) {
    return res.status(400).json({ error: 'Error al solicitar código de verificación', details: error.message });
  }
};

// STEP 2: Validate 6-digit code AND set new password
export const confirmResetPassword = async (req: Request, res: Response) => {
  const { email, resetCode, newPassword } = req.body;

  if (!email || !resetCode || !newPassword) {
    return res.status(400).json({ error: 'Faltan datos requeridos (email, código y nueva contraseña).' });
  }

  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    const dbUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!dbUser) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // Check code match and expiration
    if (!dbUser.resetCode || dbUser.resetCode !== resetCode.trim()) {
      return res.status(400).json({ error: 'El código de verificación ingresado es incorrecto.' });
    }

    if (!dbUser.resetCodeExpires || dbUser.resetCodeExpires < new Date()) {
      return res.status(400).json({ error: 'El código de verificación ha expirado. Por favor solicita uno nuevo.' });
    }

    // Update password & clear reset code
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        password: newPassword,
        resetCode: null,
        resetCodeExpires: null
      }
    });

    if (hasFirebaseKey) {
      try {
        const userRecord = await firebaseAdmin.auth().getUserByEmail(email);
        await firebaseAdmin.auth().updateUser(userRecord.uid, { password: newPassword });
      } catch (err) {
        console.warn('Firebase sync warning:', err);
      }
    }

    return res.json({
      message: '¡Identidad verificada y contraseña actualizada con éxito! Ya puedes iniciar sesión con tu nueva clave.'
    });
  } catch (error: any) {
    return res.status(400).json({ error: 'Error al restablecer la contraseña', details: error.message });
  }
};

// Change Password in Profile section (authenticated user)
export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const user = req.user;

  if (!user || !user.uid) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const dbUser = await prisma.user.findUnique({ where: { id: user.uid } });
    if (!dbUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (dbUser.password && currentPassword && dbUser.password !== currentPassword) {
      return res.status(400).json({ error: 'La contraseña actual ingresada es incorrecta' });
    }

    await prisma.user.update({
      where: { id: user.uid },
      data: { password: newPassword }
    });

    return res.json({ message: '🛡️ Contraseña actualizada exitosamente.' });
  } catch (error: any) {
    return res.status(400).json({ error: 'Error al cambiar contraseña', details: error.message });
  }
};
