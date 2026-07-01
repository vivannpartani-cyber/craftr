import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_123", {
  apiVersion: "2026-06-24.dahlia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;

      if (userId) {
        // Upgrade the user in Supabase
        // Note: You must provide SUPABASE_SERVICE_ROLE_KEY in your env to bypass RLS 
        // and update auth.users, or update a custom 'profiles' table if you prefer.
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Example: Update a custom "profiles" table to mark the user as Pro
        // In a real app, you might also store the Stripe customer ID here.
        const { error } = await supabaseAdmin
          .from("profiles")
          .update({ is_pro: true, stripe_customer_id: session.customer as string })
          .eq("id", userId);

        if (error) {
          console.error("Error updating user to Pro:", error);
          // Don't fail the webhook, Stripe will retry if we return 500, 
          // but we might want to log this to an alert system.
        } else {
          console.log(`Successfully upgraded user ${userId} to Pro!`);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook processing failed:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
