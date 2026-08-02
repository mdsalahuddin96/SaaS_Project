import express from 'express';
import {
  createCheckoutSession,
  createPortalSession,
  getSubscriptionStatus,
} from '../controllers/payment.controller.js';

const router = express.Router();

router.get('/subscription', getSubscriptionStatus);
router.post('/create-checkout-session', createCheckoutSession);
router.post('/create-portal-session', createPortalSession);

export default router;