import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export interface ChatMessage {
  id: string;
  senderUid: string;
  senderName: string;
  message: string;
  timestamp: string;
}

// In-memory messages store for real-time fallback
const messagesStore: ChatMessage[] = [
  {
    id: '1',
    senderUid: 'system',
    senderName: 'Sistema Bot',
    message: '¡Bienvenido al canal general del Foro / Chat!',
    timestamp: new Date().toISOString()
  }
];

export const getMessages = async (_req: AuthenticatedRequest, res: Response) => {
  res.json(messagesStore);
};

export const postMessage = async (req: AuthenticatedRequest, res: Response) => {
  const { message } = req.body;
  const user = req.user;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Mensaje requerido' });
  }

  const newMessage: ChatMessage = {
    id: Date.now().toString(),
    senderUid: user?.uid || 'anon',
    senderName: user?.email ? user.email.split('@')[0] : 'Usuario',
    message,
    timestamp: new Date().toISOString()
  };

  messagesStore.push(newMessage);
  if (messagesStore.length > 100) {
    messagesStore.shift();
  }

  res.status(201).json(newMessage);
};
