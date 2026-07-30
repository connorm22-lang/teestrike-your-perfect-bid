import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCourseAdmin } from "../CourseAdminContext";

type Auction = {
  id: string;
  tee: string;
  sortKey: string;
  players: number;
  rack: number;
  current: number | null;
  bids: number;
  endsAt: number;
  status: string;
};

function formatRemaining(endsAt: number, now: number): { text: string; pulse: boolean } {
  if (!endsAt) return { text: "—", pulse: false };
  const diff = endsAt - now;
  if (diff <= 0) return { text: "00:00", pulse: true };
  const totalSec = Math.floor(diff / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return { text: `${h}h ${pad(m)}m`, pulse: false };
  if (m >= 5) return { text: `${m}m ${pad(s)}s`, pulse: false };
  return { text: `${pad(m)}:${pad(s)}`, pulse: true };
}
function pad(n: number) { return String(n).padStart(2, "0"); }

function formatTee(date: string, time: string) {
  const d = new Date(`${date}T${time}`);
  if (isNaN(d.getTime())) return `${date} · ${time}`;
  return `${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · ${d.toLocaleTimeString(
    "en-US",
    { hour: "numeric", minute: "2-digit" }
  )}`;
}

type FilterKey = "all" | "live" | "closing" | "scheduled";

export default function AdminAuctionsPage() {
  const { courseId } = useCourseAdmin();
  const [now, setNow] = useState(Date.now());
  const [filter, setFilter] = useState<FilterKey>("all");
  const [rows, setRows] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!courseId) return;
    let active = true;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("auctions")
        .select("id, tee_date, tee_time, players, rack_rate, floor_price, current_bid, bid_count, status, ends_at")
        .eq("course_id", courseId)
        .order("tee_date", { ascending: true })
        .order("tee_time", { ascending: true });
      if (!active) return;
      setRows(
        (data ?? []).map((a) => ({
          id: a.id,
          tee: formatTee(a.tee_date, a.tee_time),
          sortKey: `${a.tee_date}T${a.tee_time}`,
          players: a.players,
          rack: Number(a.rack_rate ?? 0),
          current: a.current_bid == null ? null : Number(a.current_bid),
          bids: a.bid_count ?? 0,
          endsAt: a.ends_at ? new Date(a.ends_at).getTime() : 0,
          status: String(a.status).toUpperCase(),
        }))
      );
      setLoading(false);
    })();
    return () => { active = false; };
  }, [courseId]);

  const counts = useMemo(() => ({
    all: rows.length,
    live: rows.filter((a) => a.status === "LIVE").length,
    closing: rows.filter((a) => a.status === "CLOSING").length,
    scheduled: rows.filter((a) => a.status === "SCHEDULED").length,
  }), [rows]);

  const filtered = rows.filter((a) => {
    if (filter === "all") return true;
    if (filter === "live") return a.status === "LIVE";
    if (filter === "closing") return a.status === "CLOSING";
    return a.status === "SCHEDULED";
  });

  return (
    <div>
      <h2 className="serif" style={{ marginBottom: 6 }}>Active Auctions</h2>
      <div className="subtitle-mono" style={{ marginTop: 0, marginBottom: 24 }}>
        Live marketplace activity
      </div>

      <div className="tabs">
        {([
          { k: "all", l: "All" },
          { k: "live", l: "Live" },
          { k: "closing", l: "Closing" },
          { k: "scheduled", l: "Scheduled" },
        ] as { k: FilterKey; l: string }[]).map((t) => (
          <button
            key={t.k}
            className={`tab ${filter === t.k ? "active" : ""}`}
            onClick={() => setFilter(t.k)}
          >
            {t.l}<span className="count">{counts[t.k]}</span>
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table className="t">
          <thead>
            <tr>
              <th>Tee Time</th>
              <th>Players</th>
              <th>Rack</th>
              <th>Current Bid</th>
              <th>Bids</th>
              <th>Time Left</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="dim mono" style={{ fontSize: 11, letterSpacing: "0.18em" }}>
                  {loading ? "Loading auctions…" : "No auctions yet"}
                </td>
              </tr>
            ) : filtered.map((a) => {
              const r = formatRemaining(a.endsAt, now);
              return (
                <tr key={a.id}>
                  <td>{a.tee}</td>
                  <td className="mono">{a.players}</td>
                  <td className="mono dim">${a.rack}</td>
                  <td className="mono gold">{a.current !== null ? `$${a.current}` : "—"}</td>
                  <td className="mono">{a.bids}</td>
                  <td className="mono" style={r.pulse ? { animation: "ts-pulse 1s ease-in-out infinite", color: "var(--gold)" } : undefined}>
                    {r.text}
                  </td>
                  <td>
                    <span className={`pill ${a.status.toLowerCase()}`}>
                      <span className="dot" />{a.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
