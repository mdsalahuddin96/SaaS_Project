import { getApiUrl } from "../config/frontendUrl.js";
import { stripe } from "../config/stripe.js";
import Subscription from "../models/Subscription.js";
import Tenant from "../models/Tenant.js";
import User from "../models/User.js";
// Stripe Price IDs 
const PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PRICE_ID,
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID,
};

/**
 * Stripe Checkout Session create
 */
export const createCheckoutSession = async (req, res, next) => {
  try {
    const { plan } = req.body; 
    const tenantId = req.tenantId; 

    if (!plan || !PRICE_IDS[plan]) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PLAN",
          message: "Invalid plan selected. Choose either pro or enterprise.",
        },
      });
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: {
          code: "TENANT_NOT_FOUND",
          message: "Tenant not found",
        },
      });
    }

    // Checking tenant existing subscription
    let subscription = await Subscription.findOne({ tenantId });

    let customerId = subscription?.stripeCustomerId;

    //if stripe customer is not created, it create a new customerId
    if (!customerId) {
      const adminUser = await User.findOne({
        tenantId: tenant._id,
        role: "admin",
      });
      const customerEmail = adminUser?.email || `admin@${tenant.subdomain}.com`;
      const customerName = adminUser?.name || tenant.name;

      // Creating stripe customer
      const customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
        metadata: {
          tenantId: tenant._id.toString(),
          subdomain: tenant.subdomain,
          adminUserId: adminUser ? adminUser._id.toString() : "",
        },
      });

      customerId = customer.id;

      if (!subscription) {
        subscription = await Subscription.create({
          tenantId,
          stripeCustomerId: customerId,
          plan: "free",
          status: "active",
        });
      } else {
        subscription.stripeCustomerId = customerId;
        await subscription.save();
      }
    }

    const frontendUrl =getApiUrl(tenant.subdomain)

    //create stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: PRICE_IDS[plan],
          quantity: 1,
        },
      ],
      metadata: {
        tenantId: tenant._id.toString(),
        plan,
      },
      subscription_data: {
        metadata: {
          tenantId: tenant._id.toString(),
          plan,
        },
      },
      success_url: `${frontendUrl}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/dashboard/billing?canceled=true`,
    });

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Stripe Billing Customer Portal Session create
 */
export const createPortalSession = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const tenant = await Tenant.findById(tenantId);
    const subscription = await Subscription.findOne({ tenantId });

    if (!subscription || !subscription.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        error: {
          code: "NO_STRIPE_CUSTOMER",
          message: "No active Stripe billing profile found for this tenant.",
        },
      });
    }

    const frontendUrl = getApiUrl(tenant.subdomain);

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${frontendUrl}/dashboard/billing`,
    });

    res.status(200).json({
      success: true,
      data: {
        url: portalSession.url,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Tenant present subscription info
 */
export const getSubscriptionStatus = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    let subscription = await Subscription.findOne({ tenantId });

    if (!subscription) {
      subscription = {
        plan: "free",
        status: "active",
        cancelAtPeriodEnd: false,
      };
    }

    res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};
