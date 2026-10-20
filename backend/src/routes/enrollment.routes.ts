import { Router } from 'express';
import { getEnrollments, createEnrollment, updateEnrollment } from '../controllers/enrollment.controller';
import { firebaseAuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(firebaseAuthMiddleware);

router.get('/', getEnrollments);
router.post('/', createEnrollment);
router.patch('/:id', updateEnrollment);

export default router;
