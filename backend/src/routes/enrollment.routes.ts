import { Router } from 'express';
import {
  getEnrollments,
  createEnrollment,
  updateEnrollment,
  getInvoices,
  getCertificates
} from '../controllers/enrollment.controller';
import { firebaseAuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Consultas públicas / de métricas
router.get('/', getEnrollments);
router.get('/invoices', getInvoices);
router.get('/certificates', getCertificates);

// Rutas protegidas que modifican estado
router.post('/', firebaseAuthMiddleware, createEnrollment);
router.patch('/:id', firebaseAuthMiddleware, updateEnrollment);

export default router;
