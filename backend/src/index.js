import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import tenantContext from "./middleware/tenantContext.js";
import Booking from "./models/Booking.js";
import env from "./config/env.js";
import testRoute from "./routes/testRoute.js";
import authRoute from "./routes/authRoute.js";
import bookingRoute from "./routes/booking.route.js";
import paymentRoute from "./routes/payment.route.js";
import webhookRoute from "./routes/webhook.route.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || /\.localhost:3000$/.test(origin) || origin === "http://localhost:3000") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Cookies / Sessions 
  })
);

app.use("/api/webhooks", webhookRoute);

app.use(express.json());

// Active tenant check for all route
app.use(tenantContext);

// using router
app.use("/api/test", testRoute);
app.use("/api/auth", authRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api/payments", paymentRoute);

//Testing get
app.get("/", async (req, res) => {
  res.status(200).json({ message: "Hello welcome" });
});

app.use(errorHandler);

// Database connection and server Start
mongoose
  .connect(env.MONGO_URI || "mongodb://localhost:27017/saas_booking")
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

app.listen(env.PORT, () => console.log(`Server running on port ${env.PORT}`));
