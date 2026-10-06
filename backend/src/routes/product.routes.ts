import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product.controller';
import { firebaseAuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Rutas públicas de consulta de catálogo
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Rutas protegidas para administración de cursos
router.post('/', firebaseAuthMiddleware, createProduct);
router.put('/:id', firebaseAuthMiddleware, updateProduct);
router.delete('/:id', firebaseAuthMiddleware, deleteProduct);

export default router;
