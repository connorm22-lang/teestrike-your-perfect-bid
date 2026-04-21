import { useState } from "react";

type Status = "PAID" | "PENDING" | "FAILED";
type Tx = {
  id: string;
  tee: string;
  winner: string;
  email: string;
  bid: number;
  premium: number;
  payout: number;
  status: Status;
  closed: string;
  transferId: string;
  capturedAt: string;
};

const PREMIUM_RATE = 0.14;

const TX: Tx[] = [
  { id: "t1", tee: "Sat Apr 19 · 8:00 AM", winner: "J. S***",   email: "j.s***@gmail.com",   bid: 124, status: "PAID",    closed: "Apr 18", transferId: "tr_8h2k4n", capturedAt: "Apr 18, 6:01 PM" },
  { id: "t2", tee: "Sat Apr 19 · 9:00 AM", winner: "M. R***",   email: "m.r***@gmail.com",   bid: 108, status: "PAID",    closed: "Apr 18", transferId: "tr_2j9d1x", capturedAt: "Apr 18, 6:03 PM" },
  { id: "t3", tee: "Sun Apr 20 · 7:30 AM", winner: "K. W***",   email: "kw***@yahoo.com",    bid: 156, status: "PAID",    closed: "Apr 19", transferId: "tr_p3l9z2", capturedAt: "Apr 19, 6:00 PM" },
  { id: "t4", tee: "Sun Apr 20 · 8:00 AM", winner: "D. H***",   email: "d.h***@hey.com",     bid: 89,  status: "PAID",    closed: "Apr 19", transferId: "tr_q1w8e3", capturedAt: "Apr 19, 6:02 PM" },
  { id: "t5", tee: "Mon Apr 14 · 2:30 PM", winner: "B. L***",   email: "blakelaw***@me.com", bid: 64,  status: "PAID",    closed: "Apr 13", transferId: "tr_r4t5y6", capturedAt: "Apr 13, 6:00 PM" },
  { id: "t6", tee: "Sat Apr 12 · 9:30 AM", winner: "C. P***",   email: "c.p***@gmail.com",   bid: 132, status: "PENDING", closed: "Apr 11", transferId: "tr_pending", capturedAt: "—" },
  { id: "t7", tee: "Sun Apr 13 · 8:30 AM", winner: "T. K***",   email: "t.kim***@gmail.com", bid: 119, status: "PAID",    closed: "Apr 12", transferId: "tr_n0b7v6", capturedAt: "Apr 12, 6:01 PM" },
  { id: "t8", tee: "Wed Apr 9 · 4:00 PM",  winner: "S. G***",   email: "sgreene***@gmail.com", bid: 58, status: "FAILED",  closed: "Apr 8",  transferId: "tr_failed",   capturedAt: "—" },
];

function premium(bid: number) { return Math.round(bid * PREMIUM_RATE); }

const TX_HISTORY: Record<string, { who: string; amount: number; when: string }[]> = {
  t1: [
    { who: "Open", amount: 79, when: "10:00 AM" },
    { who: "M. R***", amount: 84, when: "12:42 PM" },
    { who: "T. K***", amount: 92, when: "3:18 PM" },
    { who: "J. S***", amount: 105, when: "5:01 PM" },
    { who: "M. R***", amount: 118, when: "5:48 PM" },
    { who: "J. S***", amount: 124, when: "5:59 PM" },
  ],
};

export default function AdminTransactionsPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const totalRevenue = TX.filter((t) => t.status === "PAID").reduce((s, t) => s + t.payout || s + t.bid, 0);
  // payout = bid in this model (course gets 100%)
  const total = TX.filter((t) => t.status === "PAID").reduce((s, t) => s + t.bid, 0);

  const open = openId ? TX.find((t) => t.id === openId) : null;
  const history = open ? (TX_HISTORY[open.id] || []) : [];

  return (
    <div>
      <h2 className="serif" style={{ marginBottom: 6 }}>Transactions</h2>
      <div className="subtitle-mono" style={{ marginTop: 0, marginBottom: 24 }}>
        ${total.toLocaleString()} paid to your account · {TX.length} transactions
      </div>

      <div className="table-wrap">
        <table className="t">
          <thead>
            <tr>
              <th>Tee Time</th>
              <th>Winner</th>
              <th>Winning Bid</th>
              <th>Premium (14%)</th>
              <th>Your Payout</th>
              <th>Payout Status</th>
              <th>Date Closed</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {TX.map((t) => (
              <tr key={t.id} onClick={() => setOpenId(t.id)}>
                <td>{t.tee}</td>
                <td>
                  <div>{t.winner}</div>
                  <div className="mono dim" style={{ fontSize: 10, letterSpacing: "0.12em", marginTop: 2 }}>
                    {t.email}
                  </div>
                </td>
                <td className="mono gold">${t.bid}</td>
                <td className="mono dim">${premium(t.bid)}</td>
                <td className="mono green">${t.bid}</td>
                <td>
                  <span className={`pill ${t.status.toLowerCase()}`}>
                    <span className="dot" />{t.status}
                  </span>
                </td>
                <td className="mono dim">{t.closed}</td>
                <td>
                  <button
                    className="btn-secondary"
                    onClick={(e) => { e.stopPropagation(); setOpenId(t.id); }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <>
          <div className="drawer-backdrop" onClick={() => setOpenId(null)} />
          <div className="drawer">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div className="section-label" style={{ marginBottom: 0 }}>Transaction Detail</div>
              <button className="drawer-close" onClick={() => setOpenId(null)}>Close ✕</button>
            </div>

            <h2 className="serif" style={{ fontSize: 26 }}>{open.tee}</h2>
            <div className="subtitle-mono" style={{ marginBottom: 24 }}>
              {open.winner} · {open.email}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
              <div>
                <div className="stat-label">Winning Bid</div>
                <div className="stat-value gold" style={{ fontSize: 26 }}>${open.bid}</div>
              </div>
              <div>
                <div className="stat-label">Your Payout</div>
                <div className="stat-value green" style={{ fontSize: 26 }}>${open.bid}</div>
              </div>
              <div>
                <div className="stat-label">Transfer ID</div>
                <div className="mono" style={{ fontSize: 13 }}>{open.transferId}</div>
              </div>
              <div>
                <div className="stat-label">Captured At</div>
                <div className="mono" style={{ fontSize: 13 }}>{open.capturedAt}</div>
              </div>
            </div>

            <div className="section-label">Bid History to Close</div>
            <div>
              {history.length === 0 ? (
                <div className="dim mono" style={{ fontSize: 11, letterSpacing: "0.18em" }}>
                  Detailed history archived
                </div>
              ) : history.map((b, i) => (
                <div className="bid-row" key={i}>
                  <span className={`mono ${i === history.length - 1 ? "leader" : ""}`}>{b.who}</span>
                  <span className="mono gold">${b.amount}</span>
                  <span className="mono dim" style={{ fontSize: 10, letterSpacing: "0.18em" }}>{b.when}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
