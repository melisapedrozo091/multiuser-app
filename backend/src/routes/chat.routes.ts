import { Router } from 'express';
import { getMessages, postMessage } from '../controllers/chat.controller';
import { firebaseAuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Lectura pública del foro para visitantes
router.get('/', getMessages);

// Publicación protegida: requiere iniciar sesión
router.post('/', firebaseAuthMiddleware, postMessage);

export default router;
