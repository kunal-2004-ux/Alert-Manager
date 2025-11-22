import { Router } from 'express';
import { getSummary, getTopDrivers, getResolved, getAlertDetails, getTrends, getEvents } from '../controllers/dashboardController';
import { requireAuth } from '../middlewares/clerkAuth';

const router = Router();

// Protect all dashboard routes with Clerk
router.use(requireAuth);

router.get('/summary', getSummary);
router.get('/top-drivers', getTopDrivers);
router.get('/resolved', getResolved);
router.get('/alerts/:id', getAlertDetails);
router.get('/trends', getTrends);
router.get('/events', getEvents);

export default router;
