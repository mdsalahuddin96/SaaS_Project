import { stripe } from "../config/stripe.js";
import Subscription from "../models/Subscription.js";
import ProcessedWebhook from "../models/ProcessedWebhook.js";

/**
 * Stripe Webhook Event Processor
 */
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  // 1. Stripe Webhook Signature Verification
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook Signature Verification Failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 2. Idempotency Check (Duplicate Webhook Handling)
  const existingEvent = await ProcessedWebhook.findOne({ eventId: event.id });
  if (existingEvent) {
    console.log(`Webhook Event [${event.id}] already processed. Skipping.`);
    return res
      .status(200)
      .json({ received: true, status: "already_processed" });
  }

  try {
    // 3. Handle Specific Event Types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // 4. Save event ID to prevent future duplicate processing
    await ProcessedWebhook.create({
      eventId: event.id,
      eventType: event.type,
    });

    res.status(200).json({ received: true });
  } catch (error) {
    console.error(`Webhook Handler Error for [${event.type}]:`, error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
};

/* ==========================================================================
   Helper Event Handler Functions
   ========================================================================== */

// 1. Handle completed payment and new subscription activation
async function handleCheckoutSessionCompleted(session) {
  const tenantId = session.metadata?.tenantId;
  const plan = session.metadata?.plan || "pro";
  const stripeSubscriptionId = session.subscription;
  const stripeCustomerId = session.customer;
  if (!tenantId) {
    console.error("Tenant ID missing in checkout session metadata");
    return;
  }

  // Retrieve subscription details from Stripe
  const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId);

  await Subscription.findOneAndUpdate(
    { tenantId },
    {
      stripeCustomerId,
      stripeSubscriptionId,
      stripePriceId: stripeSub.items.data[0].price.id,
      plan,
      status: "active",
      currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    },
    { upsert: true, new: true },
  );

  console.log(
    `Tenant [${tenantId}] successfully subscribed to plan: [${plan}]`,
  );
}

// 2. Handle plan upgrades, downgrades, or periodic renewals
async function handleSubscriptionUpdated(stripeSub) {
  const customerId = stripeSub.customer;

  const subscription = await Subscription.findOne({
    stripeCustomerId: customerId,
  });
  if (!subscription) {
    console.error(`Subscription record not found for customer: ${customerId}`);
    return;
  }

  // Determine plan from Price ID (or from metadata)
  const priceId = stripeSub.items.data[0].price.id;
  let plan = subscription.plan;

  if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
    plan = "pro";
  } else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
    plan = "enterprise";
  }

  subscription.stripeSubscriptionId = stripeSub.id;
  subscription.stripePriceId = priceId;
  subscription.plan = plan;
  subscription.status = stripeSub.status; // active, past_due, etc.
  subscription.currentPeriodStart = new Date(
    stripeSub.current_period_start * 1000,
  );
  subscription.currentPeriodEnd = new Date(stripeSub.current_period_end * 1000);
  subscription.cancelAtPeriodEnd = stripeSub.cancel_at_period_end;

  await subscription.save();
  console.log(`Subscription updated for tenant [${subscription.tenantId}]`);
}

// 3. Handle complete subscription cancellation
async function handleSubscriptionCanceled(stripeSub) {
  const customerId = stripeSub.customer;

  await Subscription.findOneAndUpdate(
    { stripeCustomerId: customerId },
    {
      plan: "free",
      status: "canceled",
      cancelAtPeriodEnd: false,
    },
  );

  console.log(
    `Subscription canceled for customer [${customerId}]. Reverted to free plan.`,
  );
}

// 4. Handle failed invoice payments
async function handleInvoicePaymentFailed(invoice) {
  const customerId = invoice.customer;

  await Subscription.findOneAndUpdate(
    { stripeCustomerId: customerId },
    {
      status: "past_due",
    },
  );

  console.log(
    `Invoice payment failed for customer [${customerId}]. Status set to past_due.`,
  );
}
