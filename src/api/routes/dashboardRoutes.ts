import { Router } from 'express';
import { getSummary, getTopDrivers, getAutoClosed, getTrends, getEvents, getAlertDetails } from '../controllers/dashboardController';

const router = Router();

router.get('/summary', getSummary);
router.get('/top-drivers', getTopDrivers);
router.get('/auto-closed', getAutoClosed);
router.get('/trends', getTrends);
router.get('/events', getEvents);
router.get('/alert/:id', getAlertDetails);

export default router;
