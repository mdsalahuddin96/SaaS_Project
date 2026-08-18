import express from 'express';
import { getTenantSettings, updateTenantSettings } from '../controllers/tenantSettings.controller.js';


const router = express.Router();

router.get('/:subdomain', getTenantSettings);
router.put('/:subdomain', updateTenantSettings);

export default router;