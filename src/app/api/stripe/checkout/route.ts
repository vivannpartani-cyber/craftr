import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_123", {
  apiVersion: "2026-06-24.dahlia",
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // 1. Get the current user
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. We need a host URL for success/cancel redirects
    const host = req.headers.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const origin = `${protocol}://${host}`;

    // 3. Create Stripe Checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Craftr Pro",
              description: "Premium AI models and unlimited project generation.",
            },
            unit_amount: 4900, // $49.00
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/dashboard?stripe=success`,
      cancel_url: `${origin}/dashboard?stripe=canceled`,
      // Pass the user ID so the webhook knows who paid
      client_reference_id: user.id,
      customer_email: user.email,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
