import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { firebaseAdmin, hasFirebaseKey } from '../services/firebase.service';
import { JWT_SECRET, AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../prisma/client';
import { sendWelcomeEmail, sendPasswordResetEmail, sendArrepentimientoEmail } from '../services/email.service';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    // 1. Verify user in MySQL database first
    const dbUser = await prisma.user.findUnique({ where: { email } });
    if (!dbUser) {
      return res.status(401).json({ error: 'Credenciales inválidas o usuario no registrado' });
    }

    // 2. Verify stored password using bcrypt (with plaintext fallback for seeds)
    let isPasswordValid = false;
    if (dbUser.password) {
      if (dbUser.password.startsWith('$2a$') || dbUser.password.startsWith('$2b$')) {
        isPasswordValid = await bcrypt.compare(password, dbUser.password);
      } else {
        isPasswordValid = (dbUser.password === password);
        if (isPasswordValid) {
          // Auto-migrate plaintext to bcrypt hash
          const hashed = await bcrypt.hash(password, 10);
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { password: hashed }
          });
        }
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // 3. Optional: sync/create user in Firebase Auth if key exists
    let firebaseCustomToken: string | null = null;
    if (hasFirebaseKey) {
      try {
        let userRecord;
        try {
          userRecord = await firebaseAdmin.auth().getUserByEmail(email);
        } catch {
          userRecord = await firebaseAdmin.auth().createUser({
            uid: dbUser.id,
            email: dbUser.email,
            displayName: dbUser.displayName || undefined,
            password: password.length >= 6 ? password : undefined
          });
        }
        await firebaseAdmin.auth().setCustomUserClaims(userRecord.uid, { role: dbUser.role });
        firebaseCustomToken = await firebaseAdmin.auth().createCustomToken(userRecord.uid, { role: dbUser.role });
      } catch (fbSyncErr: any) {
        console.warn('Firebase user sync non-blocking warning:', fbSyncErr?.message);
      }
    }

    // 4. Generate local JWT token (valid for all endpoints)
    const token = jwt.sign(
      { uid: dbUser.id, email: dbUser.email, role: dbUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      firebaseToken: firebaseCustomToken,
      user: {
        id: dbUser.id,
        uid: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
        displayName: dbUser.displayName
      }
    });
  } catch (error: any) {
    return res.status(401).json({ error: 'Error de autenticación', details: error.message });
  }
};

export const register = async (req: Request, res: Response) => {
  const { email, password, displayName, role } = req.body;
  try {
    const assignedRole = role === 'ADMIN' ? 'ADMIN' : 'CLIENTE';
    const hashedPassword = await bcrypt.hash(password, 10);

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
          password: hashedPassword,
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
        password: hashedPassword,
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

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password & clear reset code
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        password: hashedPassword,
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

    let isMatch = false;
    if (dbUser.password) {
      if (dbUser.password.startsWith('$2a$') || dbUser.password.startsWith('$2b$')) {
        isMatch = await bcrypt.compare(currentPassword, dbUser.password);
      } else {
        isMatch = (dbUser.password === currentPassword);
      }
    }

    if (!isMatch) {
      return res.status(400).json({ error: 'La contraseña actual ingresada es incorrecta' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.uid },
      data: { password: hashedPassword }
    });

    return res.json({ message: '🛡️ Contraseña actualizada exitosamente.' });
  } catch (error: any) {
    return res.status(400).json({ error: 'Error al cambiar contraseña', details: error.message });
  }
};

export const processArrepentimiento = async (req: Request, res: Response) => {
  const { fullName, email, trackingNumber, orderCode, dni, reason } = req.body;
  if (!email || !fullName) {
    return res.status(400).json({ error: 'Nombre y correo electrónico son requeridos' });
  }

  try {
    const tracking = trackingNumber || 'REV-' + Math.floor(100000 + Math.random() * 900000);
    sendArrepentimientoEmail(email, fullName, tracking, orderCode, dni, reason).catch(err => {
      console.error('Error enviando email de arrepentimiento:', err);
    });

    return res.json({ success: true, trackingNumber: tracking, message: 'Solicitud de revocación procesada correctamente' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Error al procesar solicitud de arrepentimiento', details: error.message });
  }
};

