import express from "express"
import mongoose from "mongoose";
import tenantContext from "./middleware/tenantContext.js";
import Booking from "./models/Booking.js"
import env from "./config/env.js"
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth/auth.js";
import testRoute from "./routes/testRoute.js"
const app = express();


app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

// using router
app.use("/api/test", testRoute)

// Active tenant check for all route
app.use(tenantContext);

//Testing get
app.get("/",async(req,res)=>{
  res.status(200).json({message:"Hello welcome"})
})
// Test booking route
app.get('/api/bookings', async (req, res) => {
  if (!req.tenantId) {
    return res.status(400).json({ error: 'Not get booking data without subdomain' });
  }

  try {
    // only the current tenant's data will come in
    const bookings = await Booking.find({ tenantId: req.tenantId }).populate('userId');
    res.json({ success: true, tenantId: req.tenantId, bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Database connection and server Start
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/saas_booking')
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));