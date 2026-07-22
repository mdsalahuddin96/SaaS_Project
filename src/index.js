import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import tenantContext from "./middleware/tenantContext.js";
import Booking from "./models/Booking.js";
import env from "./config/env.js";
import testRoute from "./routes/testRoute.js";
import authRoute from "./routes/authRoute.js";
const app = express();
app.use(express.json());
app.use(cors());

// Active tenant check for all route
app.use(tenantContext);

// using router
app.use("/api/test", testRoute);
app.use("/api", authRoute);

//Testing get
app.get("/", async (req, res) => {
  res.status(200).json({ message: "Hello welcome" });
});

// Test booking route
app.get("/api/bookings", async (req, res) => {
  if (!req.tenantId) {
    return res
      .status(400)
      .json({ error: "Not get booking data without subdomain" });
  }

  try {
    // only the current tenant's data will come in
    const bookings = await Booking.find({ tenantId: req.tenantId }).populate(
      "userId",
    );
    res.json({ success: true, tenantId: req.tenantId, bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Database connection and server Start
mongoose
  .connect(env.MONGO_URI || "mongodb://localhost:27017/saas_booking")
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

app.listen(env.PORT, () =>
  console.log(`Server running on port ${env.PORT}`),
);
