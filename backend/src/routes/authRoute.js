
import express from "express"
import { registerTenant } from "../controllers/onboardingController.js";
const router=express.Router()
router.post('/onboard', registerTenant);

export default router