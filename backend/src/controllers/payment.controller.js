import { stripe } from "../config/stripe.js";
import Subscription from "../models/Subscription.js";
import Tenant from "../models/Tenant.js";
import User from "../models/User.js";
// Stripe Price IDs (আপনার Stripe Dashboard-এ তৈরি করা Product Price ID দিয়ে রিপ্লেস করবেন)
const PRICE_IDS = {
  pro: process.env.STRIPE_PRO_PRICE_ID,
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID,
};

/**
 * Stripe Checkout Session create
 */
export const createCheckoutSession = async (req, res, next) => {
  try {
    const { plan } = req.body; // 'pro' or 'enterprise'
    const tenantId = req.tenantId; // tenantId from Tenant middleware

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

    // ১. টেন্যান্টের বিদ্যমান সাবস্ক্রিপশন রেকর্ড চেক বা তৈরি
    let subscription = await Subscription.findOne({ tenantId });

    let customerId = subscription?.stripeCustomerId;

    // যদি স্ট্রাইপে কাস্টমার না তৈরি করা থাকে, তবে নতুন কাস্টমার আইডি তৈরি করব
    if (!customerId) {
      // ১. টেন্যান্টের অ্যাডমিন ইউজার ফেচ করা
      const adminUser = await User.findOne({
        tenantId: tenant._id,
        role: "admin",
      });

      // ২. সেফটি ফলব্যাক সহ ইমেইল এবং নাম নির্ধারণ
      const customerEmail = adminUser?.email || `admin@${tenant.subdomain}.com`;
      const customerName = adminUser?.name || tenant.name;

      // ৩. Stripe Customer তৈরি
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

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    // ২. Stripe Checkout Session তৈরি
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
      // Metadata দিয়ে রাখা হচ্ছে যেন Webhook-এ টেন্যান্ট আইডি পাওয়া যায়
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
      success_url: `${frontendUrl}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/dashboard/billing/cancel`,
    });

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url, // এই URL-এ ফ্রন্টএন্ড থেকে ইউজারকে রিডাইরেক্ট করতে হবে
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Stripe Billing Customer Portal Session তৈরি করা
 */
export const createPortalSession = async (req, res, next) => {
  try {
    const tenantId = req.tenantId;

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

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

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
 * টেন্যান্টের বর্তমান সাবস্ক্রিপশন ইনফো দেখা
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
