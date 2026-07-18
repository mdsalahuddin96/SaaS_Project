const express = require('express');
const mongoose = require('mongoose');
const tenantContext = require('./middleware/tenantContext');
const Booking = require('./models/Booking');
const env=require("./config/env");
const app = express();
app.use(express.json());

// Active tenant check for all route
app.use(tenantContext);

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