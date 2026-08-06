import express from "express"
import {createTest} from "../controllers/testController.js";
import { auth } from "../auth/auth.js";

const router=express.Router();

router.post("/create",createTest)
router.get("/session", async (req, res) => {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  console.log(session);

  res.json(session);
});

export default router;