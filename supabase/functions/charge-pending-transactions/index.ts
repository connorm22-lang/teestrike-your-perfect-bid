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
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) return json({ error: "Stripe is not configured" }, 500);
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-01-27.acacia" });

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: pending, error } = await admin
      .from("transactions")
      .select("id, winner_id, total_charged, stripe_payment_intent_id, status")
      .eq("status", "pending")
      .is("stripe_payment_intent_id", null)
      .limit(50);

    if (error) {
      console.error("fetch pending failed", error);
      return json({ error: error.message }, 500);
    }

    let captured = 0;
    let failed = 0;
    const results: Array<Record<string, unknown>> = [];

    for (const tx of pending ?? []) {
      try {
        const { data: profile } = await admin
          .from("profiles")
          .select("stripe_customer_id, stripe_payment_method_id")
          .eq("id", tx.winner_id)
          .maybeSingle();

        const customerId = profile?.stripe_customer_id;
        const paymentMethodId = profile?.stripe_payment_method_id;

        if (!customerId || !paymentMethodId) {
          await admin.from("transactions").update({ status: "failed" }).eq("id", tx.id)
            .eq("status", "pending").is("stripe_payment_intent_id", null);
          failed++;
          results.push({ id: tx.id, status: "failed", reason: "NO_PAYMENT_METHOD" });
          continue;
        }

        const amount = Math.round(Number(tx.total_charged) * 100);
        if (!Number.isFinite(amount) || amount <= 0) {
          await admin.from("transactions").update({ status: "failed" }).eq("id", tx.id)
            .eq("status", "pending").is("stripe_payment_intent_id", null);
          failed++;
          results.push({ id: tx.id, status: "failed", reason: "INVALID_AMOUNT" });
          continue;
        }

        const intent = await stripe.paymentIntents.create(
          {
            amount,
            currency: "usd",
            customer: customerId,
            payment_method: paymentMethodId,
            off_session: true,
            confirm: true,
            metadata: { transaction_id: tx.id, winner_id: tx.winner_id },
          },
          { idempotencyKey: `teestrike_tx_${tx.id}` },
        );

        if (intent.status === "succeeded" || intent.status === "requires_capture") {
          await admin
            .from("transactions")
            .update({
              status: "captured",
              stripe_payment_intent_id: intent.id,
              captured_at: new Date().toISOString(),
            })
            .eq("id", tx.id);
          captured++;
          results.push({ id: tx.id, status: "captured", payment_intent: intent.id });
        } else {
          await admin
            .from("transactions")
            .update({ status: "failed", stripe_payment_intent_id: intent.id })
            .eq("id", tx.id);
          failed++;
          results.push({ id: tx.id, status: "failed", reason: intent.status });
        }
      } catch (e) {
        const err = e as { message?: string; raw?: { payment_intent?: { id?: string } } };
        console.error("charge failed for transaction", tx.id, err?.message);
        await admin
          .from("transactions")
          .update({
            status: "failed",
            stripe_payment_intent_id: err?.raw?.payment_intent?.id ?? null,
          })
          .eq("id", tx.id)
          .eq("status", "pending");
        failed++;
        results.push({ id: tx.id, status: "failed", reason: err?.message ?? "STRIPE_ERROR" });
      }
    }

    return json({ processed: pending?.length ?? 0, captured, failed, results });
  } catch (e) {
    console.error("charge-pending-transactions error", e);
    return json({ error: (e as Error).message ?? "Unexpected error" }, 500);
  }
});
