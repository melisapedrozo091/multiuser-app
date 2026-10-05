import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../prisma/client';
import { firebaseAdmin } from '../services/firebase.service';

export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol ADMIN.' });
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al listar usuarios', details: error.message });
  }
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol ADMIN.' });
  }

  const { id } = req.params;
  const { role } = req.body;

  if (!['ADMIN', 'CLIENTE'].includes(role)) {
    return res.status(400).json({ error: 'Rol no válido. Usar ADMIN o CLIENTE.' });
  }

  try {
    // Actualizar en Prisma
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role }
    });

    // Actualizar custom claims en Firebase
    try {
      await firebaseAdmin.auth().setCustomUserClaims(id, { role });
    } catch (fbErr) {
      console.warn('Advertencia Firebase Custom Claims:', fbErr);
    }

    res.json(updatedUser);
  } catch (error: any) {
    res.status(400).json({ error: 'Error al cambiar rol de usuario', details: error.message });
  }
};
