import { Router } from 'express';
import { createAlert, createBatchAlerts, resolveAlert } from '../controllers/alertController';

const router = Router();

router.post('/', createAlert);
router.post('/batch', createBatchAlerts);
router.patch('/:id/resolve', resolveAlert);

export default router;
