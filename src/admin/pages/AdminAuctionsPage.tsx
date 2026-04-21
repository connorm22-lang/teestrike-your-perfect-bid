import { useState, useEffect, useMemo } from "react";
import { useAdminToast } from "../useToast";

type Status = "LIVE" | "CLOSING" | "SCHEDULED";
type Auction = {
  id: string;
  tee: string;
  players: number;
  rack: number;
  current: number | null;
  bids: number;
  endsAt: number; // ms timestamp
  scheduledOpensLabel?: string;
  status: Status;
};

const NOW = Date.now();

const SEED: Auction[] = [
  { id: "a1", tee: "Sat Apr 26 · 8:30 AM", players: 4, rack: 79, current: 95, bids: 4, endsAt: NOW + (2 * 60 + 14) * 60_000, status: "LIVE" },
  { id: "a2", tee: "Sat Apr 26 · 9:00 AM", players: 4, rack: 79, current: null, bids: 0, endsAt: 0, scheduledOpensLabel: "Opens 6 PM", status: "SCHEDULED" },
  { id: "a3", tee: "Sun Apr 27 · 7:30 AM", players: 4, rack: 89, current: 134, bids: 7, endsAt: NOW + 47 * 1000, status: "CLOSING" },
  { id: "a4", tee: "Sun Apr 27 · 8:00 AM", players: 2, rack: 59, current: 78, bids: 3, endsAt: NOW + (4 * 60 + 2) * 60_000, status: "LIVE" },
  { id: "a5", tee: "Mon Apr 28 · 2:30 PM", players: 4, rack: 49, current: null, bids: 1, endsAt: NOW + 12 * 60 * 60_000, status: "LIVE" },
  { id: "a6", tee: "Mon Apr 28 · 3:00 PM", players: 4, rack: 49, current: 54, bids: 2, endsAt: NOW + 13 * 60 * 60_000, status: "LIVE" },
];

const MOCK_BID_HISTORY: Record<string, { who: string; amount: number; when: string }[]> = {
  a1: [
    { who: "M. R***", amount: 80, when: "3h ago" },
    { who: "T. K***", amount: 85, when: "2h ago" },
    { who: "J. S***", amount: 90, when: "1h ago" },
    { who: "M. R***", amount: 92, when: "20 min ago" },
    { who: "J. S***", amount: 95, when: "2 min ago" },
  ],
  a3: [
    { who: "B. L***", amount: 100, when: "5h ago" },
    { who: "C. P***", amount: 110, when: "4h ago" },
    { who: "K. W***", amount: 118, when: "2h ago" },
    { who: "B. L***", amount: 122, when: "1h ago" },
    { who: "D. H***", amount: 128, when: "10 min ago" },
    { who: "K. W***", amount: 134, when: "1 min ago" },
  ],
};

function formatRemaining(endsAt: number, now: number): { text: string; pulse: boolean } {
  if (endsAt === 0) return { text: "—", pulse: false };
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

type FilterKey = "all" | "live" | "closing" | "scheduled";

export default function AdminAuctionsPage() {
  const [now, setNow] = useState(Date.now());
  const [filter, setFilter] = useState<FilterKey>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const { showToast, toastNode } = useAdminToast();

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const counts = useMemo(() => ({
    all: SEED.length,
    live: SEED.filter((a) => a.status === "LIVE").length,
    closing: SEED.filter((a) => a.status === "CLOSING").length,
    scheduled: SEED.filter((a) => a.status === "SCHEDULED").length,
  }), []);

  const filtered = SEED.filter((a) => {
    if (filter === "all") return true;
    if (filter === "live") return a.status === "LIVE";
    if (filter === "closing") return a.status === "CLOSING";
    return a.status === "SCHEDULED";
  });

  const open = openId ? SEED.find((a) => a.id === openId) : null;
  const history = open ? (MOCK_BID_HISTORY[open.id] || []) : [];
  const leader = history[history.length - 1];

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
            {filtered.map((a) => {
              const r = formatRemaining(a.endsAt, now);
              return (
                <tr key={a.id} onClick={() => setOpenId(a.id)}>
                  <td>{a.tee}</td>
                  <td className="mono">{a.players}</td>
                  <td className="mono dim">${a.rack}</td>
                  <td className="mono gold">{a.current !== null ? `$${a.current}` : "—"}</td>
                  <td className="mono">{a.bids}</td>
                  <td className="mono" style={r.pulse ? { animation: "ts-pulse 1s ease-in-out infinite", color: "var(--gold)" } : undefined}>
                    {a.scheduledOpensLabel || r.text}
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

      {open && (
        <>
          <div className="drawer-backdrop" onClick={() => setOpenId(null)} />
          <div className="drawer">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div className="section-label" style={{ marginBottom: 0 }}>Auction Detail</div>
              <button className="drawer-close" onClick={() => setOpenId(null)}>Close ✕</button>
            </div>

            <h2 className="serif" style={{ fontSize: 26 }}>{open.tee}</h2>
            <div className="subtitle-mono" style={{ marginBottom: 24 }}>
              {open.players} players · Rack ${open.rack}
            </div>

            <div style={{ display: "flex", gap: 24, marginBottom: 28 }}>
              <div>
                <div className="stat-label">Current</div>
                <div className="stat-value gold" style={{ fontSize: 28 }}>
                  {open.current !== null ? `$${open.current}` : "—"}
                </div>
              </div>
              <div>
                <div className="stat-label">Leader</div>
                <div className="stat-value" style={{ fontSize: 22, fontFamily: "var(--mono)" }}>
                  {leader ? leader.who : "—"}
                </div>
              </div>
            </div>

            <div className="section-label">Bid History</div>
            <div style={{ marginBottom: 28 }}>
              {history.length === 0 ? (
                <div className="dim mono" style={{ fontSize: 11, letterSpacing: "0.18em" }}>
                  No bids yet
                </div>
              ) : history.map((b, i) => (
                <div className="bid-row" key={i}>
                  <span className={`mono ${i === history.length - 1 ? "leader" : ""}`}>{b.who}</span>
                  <span className="mono gold">${b.amount}</span>
                  <span className="mono dim" style={{ fontSize: 10, letterSpacing: "0.18em" }}>{b.when}</span>
                </div>
              ))}
            </div>

            <button
              className="btn-secondary btn-danger"
              onClick={() => {
                if (confirm("Cancel this auction? Bidders will be notified and refunded.")) {
                  showToast("Auction cancelled", "error");
                  setOpenId(null);
                }
              }}
            >
              Cancel Auction
            </button>
          </div>
        </>
      )}

      {toastNode}
    </div>
  );
}
