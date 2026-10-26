import { Router } from 'express';
import {
  getUsers,
  createUser,
  updateUserRole,
  getDashboardMetrics,
  importCourses
} from '../controllers/admin.controller';

const router = Router();

router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:id/role', updateUserRole);
router.get('/metrics', getDashboardMetrics);
router.post('/courses/import', importCourses);

export default router;
