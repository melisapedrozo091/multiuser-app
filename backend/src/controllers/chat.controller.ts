import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { prisma } from '../prisma/client';

export const getMessages = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      orderBy: { timestamp: 'asc' }
    });
    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener mensajes', details: error.message });
  }
};

export const postMessage = async (req: AuthenticatedRequest, res: Response) => {
  const { message } = req.body;
  const user = req.user;

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Mensaje requerido' });
  }

  if (!user || !user.uid) {
    return res.status(401).json({ error: 'Debes iniciar sesión para publicar en el foro' });
  }

  try {
    const userProfile = await prisma.user.findUnique({
      where: { id: user.uid }
    });

    const senderName = userProfile?.displayName || userProfile?.email || user.email || 'Usuario Registrado';

    const newMessage = await prisma.chatMessage.create({
      data: {
        senderUid: user.uid,
        senderName,
        message: message.trim()
      }
    });

    res.status(201).json(newMessage);
  } catch (error: any) {
    res.status(500).json({ error: 'Error al guardar mensaje en la base de datos', details: error.message });
  }
};
