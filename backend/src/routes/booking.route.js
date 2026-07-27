import express from "express";
import {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
} from "../controllers/booking.controller.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { idempotency } from "../middleware/idempotency.js";
import {
  createBookingSchema,
  updateBookingSchema,
} from "../validations/bookings.validation.js";

const router = express.Router();

router.get("/", getBookings);
router.post("/",idempotency ,validateRequest(createBookingSchema), createBooking);
router.patch("/:id", validateRequest(updateBookingSchema), updateBooking);
router.delete("/:id", deleteBooking);

export default router;
