import { z } from 'zod';

// Create Booking Validation Schema
export const createBookingSchema = z.object({
  customerName: z
    .string({ required_error: 'Customer name is required' })
    .min(2, 'Name must be at least 2 characters'),
  customerEmail: z
    .string({ required_error: 'Customer email is required' })
    .email('Invalid email address format'),
  customerPhone: z
    .string()
    .optional(),
  serviceName: z
    .string({ required_error: 'Service name is required' })
    .min(2, 'Service name is required'),
  bookingDate: z
    .string({ required_error: 'Booking date is required' })
    .refine((dateStr) => !isNaN(Date.parse(dateStr)), {
      message: 'Invalid date format (ISO format expected)',
    }),
  startTime: z
    .string({ required_error: 'Start time is required' })
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format (e.g., 09:30 or 14:00)'),
  endTime: z
    .string({ required_error: 'End time is required' })
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format (e.g., 10:30 or 15:00)'),
  status: z
    .enum(['pending', 'confirmed', 'cancelled', 'completed'])
    .default('pending'),
  notes: z.string().optional(),
});

// Update Booking Validation Schema
export const updateBookingSchema = createBookingSchema.partial();