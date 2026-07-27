import { getApiUrl } from "../config/getApiUrl";

// Unique Idempotency Key তৈরির জন্য হেলপার
const generateIdempotencyKey = () => {
  return 'idemp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
};


/**
 * টেন্যান্টের সব বুকিং ফেচ করা
 */
export const fetchBookings = async (subdomain, dateFilter = '') => {
  const url = getApiUrl(subdomain)
  if (dateFilter) {
    url.searchParams.append('date', dateFilter);
  }

  const response = await fetch(`${url}/bookings`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-subdomain': subdomain, // সাবডোমেন পাঠানো হচ্ছে
    },
  });

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error?.message || 'Failed to fetch bookings');
  }

  return result;
};