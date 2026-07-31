import { useEffect, useState } from "react";
import { useCourseAdmin } from "../CourseAdminContext";
import { supabase } from "@/integrations/supabase/client";

type Summary = {
  liveAuctions: number;
  totalBids: number;
  highestBid: number | null;
  activeValue: number;
  salesCount: number;
  salesRevenue: number;
};

const EMPTY: Summary = {
  liveAuctions: 0,
  totalBids: 0,
  highestBid: null,
  activeValue: 0,
  salesCount: 0,
  salesRevenue: 0,
};

function money(n: number) {
  return `$${Math.round(n).toLocaleString()}`;
}

export default function AdminDashboardPage() {
  const { courseName, courseId } = useCourseAdmin();
  const [summary, setSummary] = useState<Summary>(EMPTY);
  const [recent, setRecent] = useState<
    { id: string; label: string; amount: number | null; when: string; tone: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    let active = true;

    (async () => {
      setLoading(true);
      const [{ data: auctions }, { data: txs }] = await Promise.all([
        supabase
          .from("auctions")
          .select("id, tee_date, tee_time, current_bid, floor_price, bid_count, status, updated_at")
          .eq("course_id", courseId),
        supabase
          .from("transactions")
          .select("id, winning_bid, total_charged, status, created_at")
          .eq("course_id", courseId)
          .order("created_at", { ascending: false }),
      ]);

      if (!active) return;

      const live = (auctions ?? []).filter((a) => a.status === "live" || a.status === "closing");
      const bids = live.reduce((s, a) => s + (a.bid_count ?? 0), 0);
      const highest = live.reduce<number | null>((m, a) => {
        const v = a.current_bid == null ? null : Number(a.current_bid);
        if (v == null) return m;
        return m == null || v > m ? v : m;
      }, null);
      setSummary({
        liveAuctions: live.length,
        totalBids: bids,
        highestBid: highest,
        activeValue: 0,
        salesCount: (txs ?? []).length,
        salesRevenue: (txs ?? []).reduce((s, t) => s + Number(t.winning_bid ?? 0), 0),
      });

      setRecent(
        (txs ?? []).slice(0, 6).map((t) => ({
          id: t.id,
          label: `Sale closed · ${t.status}`,
          amount: Number(t.winning_bid ?? 0),
          when: new Date(t.created_at).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }),
          tone: t.status === "paid_out" || t.status === "captured" ? "green" : "",
        }))
      );
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [courseId]);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const courseFirstWord = (courseName || "Course").split(" ")[0];

  const STATS = [
    { label: "Live Auctions", value: String(summary.liveAuctions), sub: "Bidding now", tone: "" },
    { label: "Total Bids", value: String(summary.totalBids), sub: "Across live auctions", tone: "" },
    {
      label: "Highest Active Bid",
      value: summary.highestBid == null ? "—" : money(summary.highestBid),
      sub: summary.highestBid == null ? "No active bids yet" : "Top bid across your live auctions.",
      tone: "gold",
    },
    {
      label: "Completed Sales",
      value: String(summary.salesCount),
      sub: `${money(summary.salesRevenue)} in clearing price`,
      tone: "green",
    },
  ];

  return (
    <div>
      <h1 className="serif">
        Good morning, <em>{courseFirstWord}.</em>
      </h1>
      <div className="subtitle-mono">{today}</div>

      <div className="stat-grid">
        {STATS.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-value ${s.tone}`}>{loading ? "—" : s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="section-label">Recent Activity</div>
      <div className="activity">
        {recent.length === 0 ? (
          <div className="dim mono" style={{ fontSize: 11, letterSpacing: "0.18em" }}>
            {loading ? "Loading…" : "No completed sales yet"}
          </div>
        ) : (
          recent.map((a) => (
            <div className="activity-row" key={a.id}>
              <div className="activity-time">{a.when}</div>
              <div className={`activity-dot ${a.tone}`} />
              <div className="activity-text">
                {a.label} · <strong>{money(a.amount ?? 0)}</strong>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
