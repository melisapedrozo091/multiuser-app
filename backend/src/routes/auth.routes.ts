import { Router } from 'express';
import {
  login,
  register,
  requestResetCode,
  confirmResetPassword,
  changePassword,
  processArrepentimiento
} from '../controllers/auth.controller';
import { firebaseAuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/request-reset', requestResetCode);
router.post('/confirm-reset', confirmResetPassword);
router.post('/arrepentimiento', processArrepentimiento);

// Cambiar contraseña desde el perfil de usuario (autenticado)
router.post('/change-password', firebaseAuthMiddleware, changePassword);

export default router;
