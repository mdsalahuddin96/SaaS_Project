import express from 'express';
import { saveNoteFallback, getNoteFallback } from '../controllers/bookingNote.controller.js';

const router = express.Router();

router.get('/:bookingId', getNoteFallback);
router.post('/:bookingId/fallback', saveNoteFallback);

export default router;