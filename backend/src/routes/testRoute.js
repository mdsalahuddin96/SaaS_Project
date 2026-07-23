import express from "express"
import {createTest} from "../controllers/testController.js";

const router=express.Router();

router.post("/create",createTest)

export default router;