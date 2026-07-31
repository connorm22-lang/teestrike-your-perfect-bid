import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import Stripe from "npm:stripe@17";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) return json({ error: "Unauthorized" }, 401);
    const userId = claimsData.claims.sub as string;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "Stripe is not configured" }, 500);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-01-27.acacia" });

    const { data: profile } = await admin
      .from("profiles")
      .select("stripe_customer_id, stripe_payment_method_id, card_brand, card_last4")
      .eq("id", userId)
      .maybeSingle();

    const customerId = profile?.stripe_customer_id as string | null | undefined;
    if (!customerId) return json({ has_card: false, brand: null, last4: null });

    // Optional: a specific payment method just confirmed on the client.
    let requestedPm: string | null = null;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (typeof body?.payment_method === "string") requestedPm = body.payment_method;
      } catch { /* no body */ }
    }

    if (requestedPm) {
      try {
        await stripe.paymentMethods.attach(requestedPm, { customer: customerId });
      } catch { /* already attached */ }
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: requestedPm },
      });
    }

    const list = await stripe.paymentMethods.list({ customer: customerId, type: "card", limit: 10 });
    const customer = await stripe.customers.retrieve(customerId);
    const defaultPm =
      (customer as Stripe.Customer)?.invoice_settings?.default_payment_method as string | null;

    const chosen =
      list.data.find((pm) => pm.id === (requestedPm ?? defaultPm)) ?? list.data[0] ?? null;

    if (!chosen) {
      await admin
        .from("profiles")
        .update({ stripe_payment_method_id: null, card_brand: null, card_last4: null })
        .eq("id", userId);
      return json({ has_card: false, brand: null, last4: null });
    }

    if (!defaultPm) {
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: chosen.id },
      });
    }

    const brand = chosen.card?.brand ?? null;
    const last4 = chosen.card?.last4 ?? null;

    await admin
      .from("profiles")
      .update({ stripe_payment_method_id: chosen.id, card_brand: brand, card_last4: last4 })
      .eq("id", userId);

    return json({
      has_card: true,
      payment_method_id: chosen.id,
      brand,
      last4,
      exp_month: chosen.card?.exp_month ?? null,
      exp_year: chosen.card?.exp_year ?? null,
    });
  } catch (e) {
    console.error("payment-method error", e);
    return json({ error: (e as Error).message ?? "Unexpected error" }, 500);
  }
});
