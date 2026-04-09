import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { stripe } from "@/libs/stripe";
import prisma from "@/libs/prisma";
import { checkoutLimiter } from "@/libs/rate-limit";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { success } = checkoutLimiter(session.user.email);
    if (!success) {
      return Response.json({ error: "Too many requests" }, { status: 429 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { stripeSubscriptionId: true, plan: true },
    });

    if (!user?.stripeSubscriptionId) {
      return Response.json({ error: "No active subscription" }, { status: 400 });
    }

    // Cancel at period end — user keeps access until billing cycle ends
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    return Response.json({ success: true, message: "Subscription will cancel at end of billing period." });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return Response.json({ error: "Failed to cancel subscription" }, { status: 500 });
  }
}
