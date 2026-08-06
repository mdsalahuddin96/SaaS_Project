import { getApiUrl } from "../config/getApiUrl";

// Unique Idempotency Key
const generateIdempotencyKey = () => {
  return 'idemp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
};


/**
 * Fetch all bookings of a tenant
 */
export const fetchBookings = async (subdomain, dateFilter = '') => {
  const url = getApiUrl(subdomain)
  const response = await fetch(`${url}/bookings?date=${dateFilter}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to fetch bookings');
  }

  return result;
};
/**
 * create new booking with idempotency key
 */
export const createBooking = async (subdomain, bookingData) => {
  const idempotencyKey = generateIdempotencyKey();
  const url=getApiUrl(subdomain)
  const response = await fetch(`${url}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-idempotency-key': idempotencyKey,
    },
    body: JSON.stringify(bookingData),
  });

  const result = await response.json();
  if (!result.success) {
    const error = new Error(result.error?.message || 'Failed to create booking');
    throw error;
  }
  return result.data;
};

/**
 * Booking update(Status update / edit)
 */
export const updateBooking = async (subdomain, bookingId, updateData) => {
  const url=getApiUrl(subdomain)
  const response = await fetch(`${url}/bookings/${bookingId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || 'Failed to update booking');
  }

  return result.data;
};
/**
 * Delete booking
 */
export const deleteBooking = async (subdomain, bookingId) => {
  const url=getApiUrl(subdomain)
  const response = await fetch(`${url}/bookings/${bookingId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || 'Failed to delete booking');
  }

  return result;
};