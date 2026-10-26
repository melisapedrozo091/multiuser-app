import { Router } from 'express';
import { getReviews, createReview } from '../controllers/review.controller';
import { firebaseAuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Consulta pública de reseñas para visualizar en el foro y catálogo
router.get('/', getReviews);

// Crear o actualizar reseña (requiere inicio de sesión)
router.post('/', firebaseAuthMiddleware, createReview);

export default router;
