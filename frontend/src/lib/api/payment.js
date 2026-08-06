import { getApiUrl } from "../config/getApiUrl";

export const fetchSubscriptionStatus = async (subdomain) => {
    const url=getApiUrl(subdomain)
  const response = await fetch(`${url}/payments/subscription`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-subdomain': subdomain,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'Failed to fetch subscription status');
  }

  return result.data;
};

/**
 * Stripe Checkout Session create and redirect url 
 */
export const createCheckoutSession = async (subdomain, plan) => {
    const url=getApiUrl(subdomain)
  const response = await fetch(`${url}/payments/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-subdomain': subdomain,
    },
    body: JSON.stringify({ plan }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'Failed to initiate checkout');
  }

  return result.data; // Returns { sessionId, url }
};

/**
 * Stripe Customer Portal Session creating
 */
export const createPortalSession = async (subdomain) => {
    const url=getApiUrl(subdomain)
  const response = await fetch(`${url}/payments/create-portal-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-subdomain': subdomain,
    },
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'Failed to open customer portal');
  }

  return result.data; // Returns { url }
};