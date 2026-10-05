import { Router } from 'express';
import { getUsers, updateUserRole } from '../controllers/admin.controller';

const router = Router();

router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);

export default router;
