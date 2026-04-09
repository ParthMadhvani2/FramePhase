import { stripe, PLAN_PRICE_IDS, PLAN_LIMITS } from "@/libs/stripe";
import prisma from "@/libs/prisma";

// Helper: resolve plan name from Stripe price ID
function resolvePlan(priceId) {
  // Match price ID against env-configured Stripe price IDs
  const entry = Object.entries(PLAN_PRICE_IDS).find(([, id]) => id === priceId);
  const planName = entry ? entry[0] : 'starter';
  const videosPerMonth = PLAN_LIMITS[planName]?.videosPerMonth || 15;
  return { name: planName, videosPerMonth };
}

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      // New subscription created via checkout
      case "checkout.session.completed": {
        const session = event.data.object;
        if (!session.subscription || !session.customer) break;

        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        const priceId = subscription?.items?.data?.[0]?.price?.id;
        if (!priceId) break;

        const plan = resolvePlan(priceId);

        await prisma.user.update({
          where: { stripeCustomerId: session.customer },
          data: {
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            plan: plan.name,
            videosLimit: plan.videosPerMonth,
            videosUsed: 0,
          },
        });
        break;
      }

      // Plan upgrade/downgrade — price changed on existing subscription
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        if (!subscription.id) break;

        const priceId = subscription?.items?.data?.[0]?.price?.id;
        if (!priceId) break;

        const plan = resolvePlan(priceId);

        // Only update if the price actually changed
        const previousPriceId = event.data.previous_attributes?.items?.data?.[0]?.price?.id;
        if (previousPriceId && previousPriceId !== priceId) {
          await prisma.user.update({
            where: { stripeSubscriptionId: subscription.id },
            data: {
              stripePriceId: priceId,
              plan: plan.name,
              videosLimit: plan.videosPerMonth,
              stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });
        }
        break;
      }

      // Monthly renewal — reset usage counter
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        if (invoice.billing_reason === "subscription_cycle" && invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);

          await prisma.user.update({
            where: { stripeSubscriptionId: subscription.id },
            data: {
              stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
              videosUsed: 0,
            },
          });
        }
        break;
      }

      // Subscription cancelled
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        if (!subscription.id) break;

        await prisma.user.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            plan: "free",
            stripeSubscriptionId: null,
            stripePriceId: null,
            stripeCurrentPeriodEnd: null,
            videosLimit: 3,
          },
        });
        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return Response.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return Response.json({ received: true });
}
