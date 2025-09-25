import { Router } from 'express';
import { getRequests } from '../controllers/requestController.js';

const router = Router();

router.get('/', getRequests);

export default router;
