import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import tenantContext from "./middleware/tenantContext.js";
import Booking from "./models/Booking.js";
import env from "./config/env.js";
import testRoute from "./routes/testRoute.js";
import authRoute from "./routes/authRoute.js";
import bookingRoute from "./routes/booking.route.js"
import paymentRoute from "./routes/payment.route.js"
import { errorHandler } from "./middleware/errorHandler.js";
const app = express();
app.use(express.json());
app.use(cors());

// Active tenant check for all route
app.use(tenantContext);

// using router
app.use("/api/test", testRoute);
app.use("/api", authRoute);
app.use("/api/bookings",bookingRoute)
app.use("/api/payments",paymentRoute)

//Testing get
app.get("/", async (req, res) => {
  res.status(200).json({ message: "Hello welcome" });
});

app.use(errorHandler)

// Database connection and server Start
mongoose
  .connect(env.MONGO_URI || "mongodb://localhost:27017/saas_booking")
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

app.listen(env.PORT, () =>
  console.log(`Server running on port ${env.PORT}`),
);
