import { useCallback, useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { supabase } from "@/integrations/supabase/client";

/* ── Stripe (TEST MODE) ─────────────────────────────────── */

const STRIPE_PUBLISHABLE_KEY =
  "pk_test_51TzFsx8KM4xBmO7XkLm3Xa3tdDm6X30YxK20SUNumE25dYrwqBqhqjybQQV85UEBQjxPMnmYsFdCXdrhDHYDCZY700sj3WOXhU";

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export type CardOnFile = {
  brand: string | null;
  last4: string | null;
  paymentMethodId?: string | null;
};

/* ── HOOK: is there a card on file? ─────────────────────── */

export function useCardOnFile(userId: string | null) {
  const [card, setCard] = useState<CardOnFile | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!userId) { setCard(null); return null; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("payment-method", { body: {} });
      if (error || !data?.has_card) { setCard(null); return null; }
      const next: CardOnFile = {
        brand: data.brand ?? null,
        last4: data.last4 ?? null,
        paymentMethodId: data.payment_method_id ?? null,
      };
      setCard(next);
      return next;
    } catch {
      setCard(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) { setCard(null); return; }
    // Fast path: profile row already carries the saved card details.
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("card_brand, card_last4, stripe_payment_method_id")
        .eq("id", userId)
        .maybeSingle();
      if (cancelled) return;
      const row = data as any;
      if (row?.stripe_payment_method_id) {
        setCard({ brand: row.card_brand, last4: row.card_last4, paymentMethodId: row.stripe_payment_method_id });
      } else {
        refresh();
      }
    })();
    return () => { cancelled = true; };
  }, [userId, refresh]);

  return { card, loading, refresh, setCard };
}

export function formatCard(card: CardOnFile | null) {
  if (!card?.last4) return null;
  const brand = (card.brand || "card").replace(/(^|\s)\S/g, s => s.toUpperCase());
  return `${brand} ···· ${card.last4}`;
}

/* ── ADD CARD MODAL ─────────────────────────────────────── */

function CardForm({ onSaved, onClose, note }: {
  onSaved: () => void | Promise<void>;
  onClose: () => void;
  note?: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || busy) return;
    setErr(null);
    setBusy(true);

    const { error, setupIntent } = await stripe.confirmSetup({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setErr(error.message || "Couldn't save that card, try again");
      setBusy(false);
      return;
    }

    const pm = typeof setupIntent?.payment_method === "string"
      ? setupIntent.payment_method
      : setupIntent?.payment_method?.id;

    const { error: syncError } = await supabase.functions.invoke("payment-method", {
      body: { payment_method: pm },
    });
    if (syncError) {
      setErr("Card saved, but we couldn't refresh your profile. Try again.");
      setBusy(false);
      return;
    }

    await onSaved();
    setBusy(false);
  };

  return (
    <form onSubmit={submit}>
      {note && (
        <div style={{
          fontFamily: "var(--mono)", fontSize: 11, lineHeight: 1.6,
          color: "var(--gold)", background: "var(--gold-bg)",
          border: "1px solid var(--border-h)", borderRadius: 8,
          padding: "10px 12px", marginBottom: 16,
        }}>{note}</div>
      )}

      <PaymentElement options={{ layout: "tabs" }} />

      {err && (
        <div style={{
          marginTop: 14, fontFamily: "var(--mono)", fontSize: 11,
          color: "var(--red)",
        }}>{err}</div>
      )}

      <button type="submit" disabled={!stripe || busy} style={{
        width: "100%", marginTop: 18, padding: "14px 0",
        background: "var(--gold)", color: "#0b1a12", border: "none",
        borderRadius: 8, fontFamily: "var(--mono)", fontSize: 12,
        letterSpacing: "1.5px", fontWeight: 600,
        opacity: busy ? 0.6 : 1, cursor: busy ? "default" : "pointer",
      }}>
        {busy ? "SAVING…" : "SAVE CARD"}
      </button>

      <button type="button" onClick={onClose} style={{
        width: "100%", marginTop: 10, padding: "12px 0",
        background: "none", color: "var(--dim)",
        border: "1px solid var(--border)", borderRadius: 8,
        fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "1px",
      }}>
        NOT NOW
      </button>

      <div style={{
        marginTop: 14, textAlign: "center",
        fontFamily: "var(--mono)", fontSize: 10, color: "var(--dimmer)",
      }}>
        TEST MODE · TRY 4242 4242 4242 4242
      </div>
    </form>
  );
}

export function AddCardModal({ onClose, onSaved, note, title }: {
  onClose: () => void;
  onSaved: () => void | Promise<void>;
  note?: string;
  title?: string;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.functions.invoke("create-setup-intent", { body: {} }).then(({ data, error }) => {
      if (cancelled) return;
      if (error || !data?.client_secret) {
        setErr("Couldn't start card setup. Try again in a moment.");
        return;
      }
      setClientSecret(data.client_secret);
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 120,
      background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--card)", border: "1px solid var(--border-h)",
        borderRadius: 14, width: "100%", maxWidth: 440,
        padding: "24px 24px 22px", maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 4 }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 600 }}>
            {title || "Add a card"}
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "var(--dim)", fontSize: 22, padding: "0 4px",
          }}>×</button>
        </div>
        <div style={{
          fontFamily: "var(--mono)", fontSize: 11, color: "var(--dimmer)",
          letterSpacing: "0.5px", marginBottom: 18,
        }}>
          SAVED SECURELY WITH STRIPE · CHARGED ONLY IF YOU WIN
        </div>

        {err && (
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--red)" }}>{err}</div>
        )}

        {!clientSecret && !err && (
          <div style={{
            fontFamily: "var(--serif)", fontStyle: "italic",
            fontSize: 15, color: "var(--dim)", padding: "20px 0",
          }}>Preparing secure card form…</div>
        )}

        {clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "night",
                variables: {
                  colorPrimary: "#C9A84C",
                  colorBackground: "#0a1d13",
                  colorText: "#e8efe9",
                  colorDanger: "#e5484d",
                  fontFamily: "'DM Mono', monospace",
                  borderRadius: "8px",
                },
              },
            }}
          >
            <CardForm onSaved={onSaved} onClose={onClose} note={note} />
          </Elements>
        )}
      </div>
    </div>
  );
}

/* ── PROFILE CARD SECTION ───────────────────────────────── */

export function PaymentMethodCard({ card, loading, onAdd }: {
  card: CardOnFile | null;
  loading: boolean;
  onAdd: () => void;
}) {
  const label = formatCard(card);

  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: 12, padding: "18px 20px", marginBottom: 20,
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
    }}>
      <div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dimmer)", letterSpacing: "1px" }}>
          PAYMENT METHOD
        </div>
        <div style={{
          fontFamily: "var(--mono)", fontSize: 18, marginTop: 6,
          color: label ? "var(--gold)" : "var(--dim)",
        }}>
          {loading && !label ? "Checking…" : label || "No card on file"}
        </div>
        <div style={{
          fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 13,
          color: "var(--dim)", marginTop: 4,
        }}>
          {label
            ? "Charged only when you win a tee time."
            : "A card is required before you can bid."}
        </div>
      </div>
      <button onClick={onAdd} style={{
        background: label ? "none" : "var(--gold)",
        color: label ? "var(--gold)" : "#0b1a12",
        border: label ? "1px solid var(--border-h)" : "none",
        padding: "11px 18px", borderRadius: 8,
        fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "1px",
        whiteSpace: "nowrap", fontWeight: 600,
      }}>
        {label ? "REPLACE" : "ADD CARD"}
      </button>
    </div>
  );
}
