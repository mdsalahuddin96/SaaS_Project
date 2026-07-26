import Booking from "../models/Booking.js";

// Get All Bookings for the current tenant
export const getBookings = async (req, res, next) => {
  try {
    const { date, status } = req.query;
    const filter = { tenantId: req.tenantId };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.bookingDate = { $gte: startOfDay, $lte: endOfDay };
    }

    if (status) {
      filter.status = status;
    }
    const bookings = await Booking.find(filter)

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      message: error,
    });
    next(error);
  }
};

// Create a New Booking
export const createBooking = async (req, res, next) => {
  try {
    const bookingData = {
      ...req.body,
      tenantId: req.tenantId, // Isolated to current tenant context
    };

    const booking = await Booking.create(bookingData);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// Update Booking Status / Details
export const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOneAndUpdate(
      { _id: id, tenantId: req.tenantId },
      req.body,
      { new: true, runValidators: true },
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Booking not found" },
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// Delete / Cancel Booking
export const deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findOneAndDelete({
      _id: id,
      tenantId: req.tenantId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Booking not found" },
      });
    }

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
