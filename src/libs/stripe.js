import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-04-10",
  typescript: false,
});

/*
 * Server-side plan config with Stripe price IDs.
 * Client-side plan data lives in /libs/plans.js
 * This file maps plan names to env var price IDs.
 */
export const PLAN_PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_STARTER,
  pro: process.env.STRIPE_PRICE_PRO,
  business: process.env.STRIPE_PRICE_BUSINESS,
};

export const PLAN_LIMITS = {
  free: { videosPerMonth: 3 },
  starter: { videosPerMonth: 15 },
  pro: { videosPerMonth: 50 },
  business: { videosPerMonth: 200 },
  admin: { videosPerMonth: 999999 },
};

export function getPriceId(planId) {
  return PLAN_PRICE_IDS[planId] || null;
}

export function getVideosLimit(planName) {
  return PLAN_LIMITS[planName]?.videosPerMonth || 3;
}
