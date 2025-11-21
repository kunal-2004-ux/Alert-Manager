import { Router } from 'express';
import { getSummary, getTopDrivers, getAutoClosed, getAlertDetails } from '../controllers/dashboardController';

const router = Router();

router.get('/summary', getSummary);
router.get('/top-drivers', getTopDrivers);
router.get('/auto-closed', getAutoClosed);
router.get('/alerts/:id', getAlertDetails);

export default router;
