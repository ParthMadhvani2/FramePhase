import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { stripe } from "@/libs/stripe";
import prisma from "@/libs/prisma";
import { checkoutLimiter } from "@/libs/rate-limit";

// Map plan IDs to server-side env vars — NEVER expose price IDs to the client
const PLAN_PRICE_MAP = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro: process.env.STRIPE_PRICE_PRO,
  business: process.env.STRIPE_PRICE_BUSINESS,
};

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Rate limit by user email
    const { success: rateLimitOk, resetIn } = checkoutLimiter(session.user.email);
    if (!rateLimitOk) {
      return Response.json(
        { error: "Too many requests. Please wait." },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(resetIn / 1000)) } }
      );
    }

    const body = await req.json();
    const { planId } = body;

    if (!planId || !PLAN_PRICE_MAP[planId]) {
      return Response.json({ error: "Invalid plan" }, { status: 400 });
    }

    const priceId = PLAN_PRICE_MAP[planId];
    if (!priceId) {
      return Response.json({ error: "Plan not configured. Please contact support." }, { status: 503 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId = user.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: { userId: user.id },
      });
      stripeCustomerId = customer.id;

      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?success=true`,
      cancel_url: `${appUrl}/pricing?canceled=true`,
      metadata: { userId: user.id },
    });

    return Response.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return Response.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
