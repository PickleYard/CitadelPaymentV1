import { NextResponse } from "next/server";
import Stripe from "stripe";

const { STRIPE_SECRET_KEY } = process.env;

export async function POST(req: Request) {
  if (!STRIPE_SECRET_KEY) {
    throw 'Server misconfigured. Did you forget to add a ".env.local" file?';
  }

  const { buyerWalletAddress } = await req.json();
  if (!buyerWalletAddress) {
    throw 'Request is missing "buyerWalletAddress".';
  }

  // Create a Stripe payment intent for $98 USD.
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2023-10-16",
  });
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 98_00,
    currency: "usd",
    description: "CultivateCrypto Citadel Payment",
    payment_method_types: ["card"],
    metadata: { buyerWalletAddress },
  });

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
  });
}
