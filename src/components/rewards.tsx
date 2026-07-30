import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/* ─────────────────────────────────────────────────────────
   REWARDS — second-chance offers + TeeStrike credit
   Styling matches the marketplace design tokens (vars in css).
   ───────────────────────────────────────────────────────── */

const db = supabase as any;

const money = (n: number) => `$${Math.round(n).toLocaleString()}`;

function fmtTime(t?: string | null) {
  if (!t) return "";
  const [hStr, m] = t.split(":");
  const h = parseInt(hStr, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${m} ${ampm}`;
}

function fmtDate(d?: string | null) {
  if (!d) return "";
  const [y, m, day] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
}

interface AuctionCtx {
  course: string;
  tee_date: string;
  tee_time: string;
  players: number;
  final_price: number | null;
  current_bid: number | null;
}

export interface OfferCtx {
  id: string;
  price: number;
  expires_at: string;
  source: AuctionCtx | null;
  offered: AuctionCtx | null;
}

async function fetchAuctionCtx(id: string): Promise<AuctionCtx | null> {
  const { data } = await db
    .from("auctions")
    .select("tee_date, tee_time, players, final_price, current_bid, courses ( name )")
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  return {
    course: data.courses?.name ?? "TeeStrike course",
    tee_date: data.tee_date,
    tee_time: data.tee_time,
    players: data.players,
    final_price: data.final_price,
    current_bid: data.current_bid,
  };
}

/* ── HOOK: pending offer + realtime ─────────────────────── */

export function useSecondChanceOffer(userId: string | null) {
  const [offer, setOffer] = useState<OfferCtx | null>(null);
  const dismissed = useRef<Set<string>>(new Set());

  const hydrate = useCallback(async (row: any) => {
    if (!row || row.status !== "pending") return;
    if (new Date(row.expires_at).getTime() <= Date.now()) return;
    if (dismissed.current.has(row.id)) return;
    const [source, offered] = await Promise.all([
      fetchAuctionCtx(row.source_auction_id),
      fetchAuctionCtx(row.offered_auction_id),
    ]);
    setOffer({
      id: row.id,
      price: Number(row.price),
      expires_at: row.expires_at,
      source,
      offered,
    });
  }, []);

  useEffect(() => {
    if (!userId) { setOffer(null); return; }
    let cancelled = false;

    db.from("second_chance_offers")
      .select("*")
      .eq("loser_id", userId)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }: any) => {
        if (cancelled || !data?.length) return;
        hydrate(data[0]);
      });

    const channel = supabase
      .channel(`second-chance-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "second_chance_offers", filter: `loser_id=eq.${userId}` },
        (payload: any) => {
          const row = payload.new;
          if (!row) return;
          if (row.status !== "pending") {
            setOffer(prev => (prev && prev.id === row.id ? null : prev));
            return;
          }
          hydrate(row);
        }
      )
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [userId, hydrate]);

  const close = useCallback((id?: string) => {
    if (id) dismissed.current.add(id);
    setOffer(null);
  }, []);

  return { offer, close };
}

/* ── MODAL ──────────────────────────────────────────────── */

export function SecondChanceModal({ offer, userId, onClose }: {
  offer: OfferCtx;
  userId: string;
  onClose: (id?: string) => void;
}) {
  const [left, setLeft] = useState(() =>
    Math.max(0, Math.floor((new Date(offer.expires_at).getTime() - Date.now()) / 1000)));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [booked, setBooked] = useState<any>(null);

  useEffect(() => {
    const t = setInterval(() => {
      setLeft(Math.max(0, Math.floor((new Date(offer.expires_at).getTime() - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(t);
  }, [offer.expires_at]);

  const expired = left <= 0;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  const fee = Math.round(offer.price * 0.14);

  const claim = async () => {
    setBusy(true); setErr(null);
    const { data, error } = await db.rpc("claim_second_chance", { p_offer_id: offer.id, p_user_id: userId });
    setBusy(false);
    if (error) { setErr("Couldn't claim this tee time, try again"); return; }
    if (data?.success) { setBooked(data); return; }
    const code = data?.error_code;
    setErr(
      code === "OFFER_EXPIRED" ? "This offer just expired"
      : code === "CLAIM_UNAVAILABLE" ? "That slot was just taken"
      : "Couldn't claim this tee time, try again"
    );
  };

  const decline = async () => {
    setBusy(true);
    await db.rpc("decline_second_chance", { p_offer_id: offer.id, p_user_id: userId });
    setBusy(false);
    onClose(offer.id);
  };

  const shell: React.CSSProperties = {
    position: "fixed", inset: 0, zIndex: 200,
    background: "rgba(0,0,0,0.8)", backdropFilter: "blur(9px)",
    display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
  };

  const panel: React.CSSProperties = {
    width: "100%", maxWidth: 470,
    background: "var(--card)", border: "1px solid var(--border-h)",
    borderRadius: 16, padding: "28px 26px",
    boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
    animation: "cardIn 0.35s ease both",
  };

  if (booked) {
    return (
      <div style={shell}>
        <div style={panel}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "2px", color: "var(--green)" }}>
            BOOKED
          </div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 30, fontWeight: 600, marginTop: 8 }}>
            The tee time is yours.
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 12.5, color: "var(--dim)", marginTop: 8, lineHeight: 1.7 }}>
            {offer.offered?.course} · {fmtDate(offer.offered?.tee_date)} · {fmtTime(offer.offered?.tee_time)}
          </div>
          <div style={{ marginTop: 18, borderTop: "1px solid var(--border)", paddingTop: 14, fontFamily: "var(--mono)", fontSize: 12.5 }}>
            {[
              ["Tee time", money(Number(booked.price))],
              ["Buyer premium", money(Number(booked.buyer_premium))],
              ...(Number(booked.credit_applied) > 0 ? [["TeeStrike credit", `−${money(Number(booked.credit_applied))}`]] : []),
              ["Total", money(Number(booked.total_charged))],
            ].map(([l, v], i, arr) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", padding: "6px 0",
                color: i === arr.length - 1 ? "var(--gold)" : "var(--dim)",
              }}>
                <span>{l}</span><span>{v}</span>
              </div>
            ))}
          </div>
          <button onClick={() => onClose(offer.id)} style={{
            width: "100%", marginTop: 20, padding: 13,
            background: "linear-gradient(135deg, var(--gold), #b89a3e)", color: "#0a0a0a",
            border: "none", borderRadius: 9, fontSize: 12, letterSpacing: "1.5px", fontWeight: 600,
          }}>DONE</button>
        </div>
      </div>
    );
  }

  return (
    <div style={shell}>
      <div style={panel}>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "2px", color: "var(--gold)" }}>
          SECOND CHANCE
        </div>
        <div style={{ fontFamily: "var(--serif)", fontSize: 31, fontWeight: 600, marginTop: 8, lineHeight: 1.15 }}>
          Outbid — but you're not out.
        </div>

        {/* the one that got away */}
        <div style={{
          marginTop: 16, fontFamily: "var(--mono)", fontSize: 12,
          color: "var(--dimmer)", textDecoration: "line-through",
        }}>
          {offer.source?.course} · {fmtTime(offer.source?.tee_time)}
          {offer.source?.final_price != null ? ` — sold ${money(Number(offer.source.final_price))}` : ""}
        </div>

        {/* the offer */}
        <div style={{
          marginTop: 16, border: "1px solid var(--gold)", borderRadius: 13,
          background: "var(--gold-bg)", padding: "20px 20px 18px",
        }}>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "2px", color: "var(--gold)" }}>
            YOUR SECOND CHANCE
          </div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 23, fontWeight: 600, marginTop: 8 }}>
            {offer.offered?.course}
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--dim)", marginTop: 4 }}>
            {fmtDate(offer.offered?.tee_date)} · {fmtTime(offer.offered?.tee_time)}
            {offer.offered?.players ? ` · ${offer.offered.players} players` : ""}
          </div>

          <div style={{
            fontFamily: "var(--mono)", fontSize: 46, fontWeight: 500,
            color: "var(--gold-bright)", marginTop: 14, letterSpacing: "-1px",
          }}>
            {money(offer.price)}
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dim)", marginTop: 2 }}>
            locked at your bid — no re-bidding
          </div>

          <div style={{
            marginTop: 14, fontFamily: "var(--mono)", fontSize: 12,
            color: expired ? "var(--red)" : left < 120 ? "var(--red)" : "var(--amber)",
            letterSpacing: "0.5px",
          }}>
            {expired ? "offer expired" : `holds ${mm}:${ss}`}
          </div>
        </div>

        {err && (
          <div style={{ marginTop: 14, fontFamily: "var(--mono)", fontSize: 11.5, color: "var(--red)" }}>{err}</div>
        )}

        <button onClick={claim} disabled={busy || expired} style={{
          width: "100%", marginTop: 18, padding: "15px",
          background: "linear-gradient(135deg, var(--gold), #b89a3e)", color: "#0a0a0a",
          border: "none", borderRadius: 9, fontSize: 12.5, letterSpacing: "1.5px", fontWeight: 600,
          opacity: busy || expired ? 0.45 : 1,
        }}>
          {busy ? "…" : `CLAIM THIS TEE TIME — ${money(offer.price)} + ${money(fee)} FEE`}
        </button>

        <button onClick={expired ? () => onClose(offer.id) : decline} disabled={busy} style={{
          width: "100%", marginTop: 10, padding: "12px",
          background: "none", border: "1px solid var(--border)", color: "var(--dim)",
          borderRadius: 9, fontSize: 11, letterSpacing: "1.5px",
        }}>
          {expired ? "CLOSE" : "NO THANKS"}
        </button>

        <div style={{
          marginTop: 14, fontFamily: "var(--mono)", fontSize: 10.5,
          color: "var(--dimmer)", textAlign: "center", lineHeight: 1.6,
        }}>
          $5 TeeStrike credit added either way — toward the fee on your next win.
        </div>
      </div>
    </div>
  );
}

/* ── CREDIT BALANCE ─────────────────────────────────────── */

export function CreditBalance({ userId }: { userId: string | null }) {
  const [total, setTotal] = useState(0);
  const [soonest, setSoonest] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    db.from("credits")
      .select("amount, expires_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .gt("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: true })
      .then(({ data }: any) => {
        if (cancelled || !data) return;
        setTotal(data.reduce((s: number, r: any) => s + Number(r.amount), 0));
        setSoonest(data[0]?.expires_at ?? null);
      });
    return () => { cancelled = true; };
  }, [userId]);

  const empty = total <= 0;

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      background: empty ? "var(--card)" : "var(--gold-bg)",
      border: `1px solid ${empty ? "var(--border)" : "var(--border-h)"}`,
      borderRadius: 12, padding: "16px 20px", marginBottom: 20,
    }}>
      <div>
        <div style={{ fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "1.5px", color: "var(--dimmer)" }}>
          TEESTRIKE CREDIT
        </div>
        <div style={{
          fontFamily: "var(--mono)", fontSize: 22, marginTop: 6,
          color: empty ? "var(--dim)" : "var(--gold)",
        }}>
          {empty ? "No credit yet" : `TeeStrike credit: ${money(total)}`}
        </div>
      </div>
      <div style={{ fontFamily: "var(--mono)", fontSize: 10.5, color: "var(--dimmer)", textAlign: "right", lineHeight: 1.6 }}>
        {empty
          ? "Bid close and get outbid — we'll credit you $5."
          : `Expires ${new Date(soonest!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
      </div>
    </div>
  );
}
