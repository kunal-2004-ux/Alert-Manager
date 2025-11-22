import { Router } from 'express';
import { getSummary, getTopDrivers, getAutoClosed, getTrends, getEvents, getAlertDetails } from '../controllers/dashboardController';
import { requireAuth } from '../middlewares/clerkAuth';

const router = Router();

// Protect all dashboard routes with Clerk
router.use(requireAuth);

router.get('/summary', getSummary);
router.get('/top-drivers', getTopDrivers);
router.get('/auto-closed', getAutoClosed);
router.get('/trends', getTrends);
router.get('/events', getEvents);
router.get('/alert/:id', getAlertDetails);

export default router;
