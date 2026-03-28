import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────
   DESIGN SYSTEM  
   Aesthetic: Dark editorial luxury — think WSJ Magazine meets
   a trading floor. Tight typography, kinetic numbers, tension.
   ───────────────────────────────────────────────────────────── */

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #060606;
  --surface: #0c0f0b;
  --card: #0f120e;
  --card-h: #151a13;
  --border: rgba(255,255,255,0.07);
  --border-h: rgba(201,168,76,0.35);
  --gold: #C9A84C;
  --gold-bright: #E2C06A;
  --gold-dim: rgba(201,168,76,0.6);
  --gold-bg: rgba(201,168,76,0.07);
  --green: #3CAF72;
  --green-dark: #2D8653;
  --green-bg: rgba(60,175,114,0.1);
  --green-border: rgba(60,175,114,0.28);
  --fairway: #1B4332;
  --red: #E05252;
  --red-bg: rgba(224,82,82,0.1);
  --amber: #E8A040;
  --white: #F5F5F0;
  --dim: rgba(245,245,240,0.45);
  --dimmer: rgba(245,245,240,0.22);
  --serif: 'Cormorant Garamond', Georgia, serif;
  --mono: 'DM Mono', monospace;
  --sans: 'DM Sans', system-ui, sans-serif;
}

body { background: var(--bg); color: var(--white); font-family: var(--sans); }

@keyframes numFlip {
  0% { transform: translateY(-8px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}
@keyframes shake {
  0%,100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}
@keyframes tsPulse {
  0%,100% { opacity:1; transform: scale(1); }
  50% { opacity:0.4; transform: scale(0.85); }
}
@keyframes toastIn {
  from { opacity:0; transform: translateY(16px) scale(0.97); }
  to { opacity:1; transform: translateY(0) scale(1); }
}
@keyframes bidFlash {
  0% { background: rgba(212,175,55,0.25); }
  100% { background: transparent; }
}
@keyframes cardIn {
  from { opacity:0; transform: translateY(12px); }
  to { opacity:1; transform: translateY(0); }
}
@keyframes tickerScroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

.bid-bump { animation: numFlip 0.25s ease forwards; }
.outbid-shake { animation: shake 0.4s ease; }
.bid-row-flash { animation: bidFlash 0.8s ease forwards; }
.card-in { animation: cardIn 0.4s ease both; }

input[type=range] {
  -webkit-appearance: none;
  width: 100%; height: 4px;
  background: rgba(255,255,255,0.1);
  border-radius: 2px; outline: none; cursor: pointer;
}
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: var(--gold);
  cursor: pointer;
  box-shadow: 0 0 0 3px rgba(212,175,55,0.2);
  transition: box-shadow 0.2s;
}
input[type=range]:hover::-webkit-slider-thumb {
  box-shadow: 0 0 0 6px rgba(212,175,55,0.15);
}

button { font-family: var(--mono); cursor: pointer; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
`;

/* ── DATA ───────────────────────────────────────────────── */

interface Course {
  id: number;
  name: string;
  short: string;
  loc: string;
  desc: string;
  rack: number;
  img: string;
  tag: string;
}

const COURSES: Course[] = [
  { id: 1, name: "Fields Ranch East", short: "Fields Ranch", loc: "Frisco · PGA HQ", desc: "PGA of America's championship-ready masterpiece. Firm, fast greens that punish mediocre approaches.", rack: 295, img: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&h=400&fit=crop", tag: "PGA HQ" },
  { id: 2, name: "TPC Craig Ranch", short: "Craig Ranch", loc: "McKinney · Tour Venue", desc: "Annual PGA Tour stop. Pure bentgrass greens, pristine conditioning year-round.", rack: 245, img: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&h=400&fit=crop", tag: "Tour" },
  { id: 3, name: "Cowboys Golf Club", short: "Cowboys GC", loc: "Grapevine · Dallas", desc: "The only NFL-themed golf club in existence. Premium experience with Star-level hospitality.", rack: 210, img: "https://images.unsplash.com/photo-1592919505780-303950717480?w=600&h=400&fit=crop", tag: "NFL" },
  { id: 4, name: "The Tribute", short: "The Tribute", loc: "The Colony · Links", desc: "Links-style championship course inspired by the great Scottish and Irish seaside courses.", rack: 195, img: "https://images.unsplash.com/photo-1600006195232-1ac2cca26e73?w=600&h=400&fit=crop", tag: "Links" },
];

interface Auction {
  id: number;
  courseId: number;
  date: string;
  time: string;
  players: number;
  bid: number;
  bids: number;
  endsIn: number;
  _flash?: boolean;
  _userLeading?: boolean;
}

const mkAuctions = (): Auction[] => [
  { id: 1, courseId: 1, date: "Sat Apr 5", time: "7:14 AM", players: 4, bid: 340, bids: 7, endsIn: 5420 },
  { id: 2, courseId: 2, date: "Fri Apr 4", time: "6:50 AM", players: 4, bid: 260, bids: 9, endsIn: 2180 },
  { id: 3, courseId: 3, date: "Sun Apr 6", time: "8:00 AM", players: 4, bid: 225, bids: 2, endsIn: 14400 },
  { id: 4, courseId: 4, date: "Sat Apr 5", time: "9:30 AM", players: 2, bid: 215, bids: 4, endsIn: 8600 },
];

const BIDDER_NAMES = ["J. Morrison", "A. Patel", "T. Walker", "R. Chen", "S. Davis", "M. Thompson", "K. Wright", "D. Garcia"];

/* ── LIVE AUCTION ENGINE ────────────────────────────────── */

interface BidEvent {
  id: number;
  auctionId: number;
  type: string;
  amount: number;
  bidder: string;
  ts: number;
}

interface OutbidAlert {
  auctionId: number;
  newBid: number;
  bidder: string;
}

function useLiveAuctions(initial: Auction[]) {
  const [auctions, setAuctions] = useState(initial);
  const [events, setEvents] = useState<BidEvent[]>([]);
  const [outbidAlert, setOutbidAlert] = useState<OutbidAlert | null>(null);
  const userBidsRef = useRef<Record<number, number>>({});

  useEffect(() => {
    const fire = () => {
      setAuctions(prev => {
        const liveAuctions = prev.filter(a => a.endsIn > 60);
        if (!liveAuctions.length) return prev;

        const weights = liveAuctions.map(a => a.endsIn < 3600 ? 3 : 1);
        const total = weights.reduce((s, w) => s + w, 0);
        let r = Math.random() * total;
        let target = liveAuctions[0];
        for (let i = 0; i < liveAuctions.length; i++) {
          r -= weights[i];
          if (r <= 0) { target = liveAuctions[i]; break; }
        }

        const increment = [10, 15, 20, 25, 25, 25, 50][Math.floor(Math.random() * 7)];
        const newBid = target.bid + increment;
        const bidder = BIDDER_NAMES[Math.floor(Math.random() * BIDDER_NAMES.length)];

        const userBid = userBidsRef.current[target.id];
        if (userBid && newBid > userBid) {
          setOutbidAlert({ auctionId: target.id, newBid, bidder });
          setTimeout(() => setOutbidAlert(null), 5000);
        }

        const event: BidEvent = { id: Date.now() + Math.random(), auctionId: target.id, type: "bid", amount: newBid, bidder, ts: Date.now() };
        setEvents(ev => [event, ...ev.slice(0, 29)]);

        return prev.map(a => a.id === target.id
          ? { ...a, bid: newBid, bids: a.bids + 1, _flash: true }
          : a
        );
      });
      setTimeout(() => setAuctions(prev => prev.map(a => ({ ...a, _flash: false }))), 800);
    };
    const interval = setInterval(fire, 2800 + Math.random() * 3200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      setAuctions(prev => prev.map(a => ({ ...a, endsIn: Math.max(0, a.endsIn - 1) })));
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const placeBid = useCallback((auctionId: number, amount: number) => {
    userBidsRef.current[auctionId] = amount;
    const event: BidEvent = { id: Date.now(), auctionId, type: "user_bid", amount, bidder: "You", ts: Date.now() };
    setEvents(ev => [event, ...ev.slice(0, 29)]);
    setAuctions(prev => prev.map(a => a.id === auctionId
      ? { ...a, bid: amount, bids: a.bids + 1, _flash: true, _userLeading: true }
      : a
    ));
    setTimeout(() => setAuctions(prev => prev.map(a => ({ ...a, _flash: false }))), 800);
  }, []);

  return { auctions, events, outbidAlert, placeBid };
}

/* ── COUNTDOWN ──────────────────────────────────────────── */

function Countdown({ seconds }: { seconds: number }) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const closing = seconds < 300;
  const urgent = seconds < 3600;
  const color = closing ? "var(--red)" : urgent ? "var(--amber)" : "var(--dimmer)";

  return (
    <span style={{ fontFamily: "var(--mono)", fontSize: 13, color, letterSpacing: "0.5px" }}>
      {h > 0 ? `${h}h ` : ""}{String(m).padStart(2, "0")}m {String(s).padStart(2, "0")}s
    </span>
  );
}

/* ── AI CADDIE ──────────────────────────────────────────── */

async function getCaddieAdvice(course: Course, auction: Auction, bidAmount: number, signal?: AbortSignal) {
  const premium = Math.round((bidAmount / course.rack - 1) * 100);
  const timeLeft = auction.endsIn < 3600 ? `${Math.floor(auction.endsIn / 60)} minutes` : `${Math.round(auction.endsIn / 3600)} hours`;

  const takes = [
    premium < 10
      ? `${course.short} at only +${premium}% is a steal — expect someone to contest this before the ${timeLeft} close. Lock it now.`
      : premium < 20
        ? `Solid read. +${premium}% on ${course.short} is right in the zone where serious golfers commit. ${auction.bids} bids means real demand.`
        : premium < 35
          ? `You're paying for access, not just a tee time. ${course.short} is worth the premium if you value the experience. ${timeLeft} left.`
          : `Bold. +${premium}% on ${course.short} sends a message. ${auction.bids} other people want this time slot — make it count.`,
  ];

  await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
  if (signal?.aborted) throw new Error("aborted");
  return takes[0];
}

/* ── OUTBID BANNER ──────────────────────────────────────── */

function OutbidBanner({ alert, auctions, onRebid, onDismiss }: {
  alert: OutbidAlert;
  auctions: Auction[];
  onRebid: (a: Auction) => void;
  onDismiss: () => void;
}) {
  const a = auctions.find(x => x.id === alert.auctionId);
  const c = COURSES.find(x => x.id === a?.courseId);
  if (!a || !c) return null;

  return (
    <div className="outbid-shake" style={{
      position: "sticky", top: 0, zIndex: 50, background: "var(--red-bg)",
      borderBottom: "1px solid var(--red)", padding: "10px 20px",
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <div style={{
        width: 8, height: 8, borderRadius: "50%", background: "var(--red)",
        animation: "tsPulse 1s ease infinite",
      }} />
      <div style={{ flex: 1 }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--red)", letterSpacing: "1px" }}>
          OUTBID — {c.short}
        </span>
        <div style={{ fontSize: 13, color: "var(--dim)", marginTop: 2 }}>
          {alert.bidder} bid ${alert.newBid}
        </div>
      </div>
      <button
        onClick={() => onRebid(a)}
        style={{
          flex: "0 0 auto", padding: "9px 18px", background: "var(--red)",
          color: "var(--white)", border: "none", borderRadius: 6,
          fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "1px",
        }}
      >
        REBID NOW
      </button>
      <button
        onClick={onDismiss}
        style={{
          background: "none", border: "none", color: "var(--dim)",
          fontSize: 18, padding: "4px 8px",
        }}
      >
        ×
      </button>
    </div>
  );
}

/* ── LIVE FEED ──────────────────────────────────────────── */

function LiveFeed({ events, auctions }: { events: BidEvent[]; auctions: Auction[] }) {
  const fmtTime = (ts: number) => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 5) return "just now";
    if (s < 60) return `${s}s ago`;
    return `${Math.floor(s / 60)}m ago`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {events.length === 0 ? (
        <div style={{ color: "var(--dimmer)", fontFamily: "var(--mono)", fontSize: 12, padding: 20, textAlign: "center" }}>
          Waiting for bids...
        </div>
      ) : events.slice(0, 15).map(e => {
        const a = auctions.find(x => x.id === e.auctionId);
        const c = COURSES.find(x => x.id === a?.courseId);
        const isUser = e.type === "user_bid";
        return (
          <div key={e.id} className="bid-row-flash" style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 14px", borderBottom: "1px solid var(--border)",
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: isUser ? "var(--gold)" : "var(--green)",
            }} />
            <div style={{ flex: 1, fontSize: 12, fontFamily: "var(--mono)" }}>
              <span style={{ color: isUser ? "var(--gold)" : "var(--white)" }}>{e.bidder}</span>
              <span style={{ color: "var(--dimmer)", margin: "0 6px" }}>→</span>
              <span style={{ color: "var(--dim)" }}>{c?.short}</span>
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: isUser ? "var(--gold)" : "var(--green)" }}>
              ${e.amount}
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dimmer)", minWidth: 50, textAlign: "right" }}>
              {fmtTime(e.ts)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── AUCTION CARD ───────────────────────────────────────── */

function AuctionCard({ auction, course, onBid, style }: {
  auction: Auction;
  course: Course;
  onBid: (a: Auction) => void;
  style?: React.CSSProperties;
}) {
  const [hov, setHov] = useState(false);
  const prevBid = useRef(auction.bid);
  const [bumped, setBumped] = useState(false);

  useEffect(() => {
    if (auction.bid !== prevBid.current) {
      setBumped(true);
      prevBid.current = auction.bid;
      setTimeout(() => setBumped(false), 300);
    }
  }, [auction.bid]);

  const premium = Math.round((auction.bid / course.rack - 1) * 100);
  const isLeading = auction._userLeading;
  const isFlash = auction._flash;

  return (
    <div
      className="card-in"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: isFlash ? "rgba(212,175,55,0.06)" : hov ? "var(--card-h)" : "var(--card)",
        border: `1px solid ${isLeading ? "var(--green-border)" : hov ? "var(--border-h)" : "var(--border)"}`,
        borderRadius: 10, overflow: "hidden", transition: "all 0.2s ease",
        ...style,
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 160, overflow: "hidden" }}>
        <img
          src={course.img}
          alt={course.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s", transform: hov ? "scale(1.05)" : "scale(1)" }}
        />
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
          padding: "20px 14px 10px",
        }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 600, color: "var(--white)" }}>
            {course.name}
          </div>
          <div style={{ fontSize: 12, color: "var(--dim)", fontFamily: "var(--mono)", marginTop: 2 }}>
            {course.loc}
          </div>
        </div>
        {isLeading && (
          <div style={{
            position: "absolute", top: 10, right: 10, background: "var(--green)",
            color: "var(--white)", fontFamily: "var(--mono)", fontSize: 10,
            padding: "3px 8px", borderRadius: 4, letterSpacing: "1px",
          }}>
            LEADING
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "14px" }}>
        {/* Tags */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {[auction.date, auction.time, `${auction.players}p`, course.tag].map((t, i) => (
            <span key={i} style={{
              fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.5px",
              padding: "3px 8px", borderRadius: 4,
              background: i === 3 ? "var(--gold-bg)" : "rgba(255,255,255,0.04)",
              color: i === 3 ? "var(--gold)" : "var(--dim)",
              border: `1px solid ${i === 3 ? "var(--border-h)" : "var(--border)"}`,
            }}>
              {t}
            </span>
          ))}
        </div>

        {/* Bid info */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dimmer)" }}>$</span>
            <span className={bumped ? "bid-bump" : ""} style={{
              fontFamily: "var(--mono)", fontSize: 26, fontWeight: 500,
              color: isLeading ? "var(--green)" : "var(--gold)",
            }}>
              {auction.bid}
            </span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dimmer)", marginLeft: 4 }}>
              /player
            </span>
          </div>
          <Countdown seconds={auction.endsIn} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dimmer)" }}>
            {auction.bids} bid{auction.bids !== 1 ? "s" : ""} · rack ${course.rack}
          </span>
          <span style={{
            fontFamily: "var(--mono)", fontSize: 11,
            color: premium > 20 ? "var(--amber)" : "var(--green)",
          }}>
            +{premium}%
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={() => onBid(auction)}
          style={{
            width: "100%",
            background: hov
              ? "linear-gradient(135deg, var(--gold), #b89a3e)"
              : "linear-gradient(135deg, var(--gold-dim), var(--gold-dim))",
            color: hov ? "#0a0a0a" : "var(--gold)",
            border: `1px solid ${hov ? "var(--gold)" : "var(--border-h)"}`,
            borderRadius: 6, padding: "11px", fontFamily: "var(--mono)",
            fontSize: 12, letterSpacing: "1.5px", fontWeight: 500,
            transition: "all 0.25s ease",
          }}
        >
          {isLeading ? "INCREASE BID" : "PLACE BID"}
        </button>
      </div>
    </div>
  );
}

/* ── BID MODAL ──────────────────────────────────────────── */

function BidModal({ auction, course, onClose, onConfirm }: {
  auction: Auction;
  course: Course;
  onClose: () => void;
  onConfirm: (id: number, amt: number) => void;
}) {
  const min = auction.bid + 5;
  const [amt, setAmt] = useState(Math.ceil((auction.bid + 25) / 25) * 25);
  const [caddie, setCaddie] = useState<string | null>(null);
  const [cLoading, setCLoading] = useState(false);
  const [done, setDone] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const premium = Math.round((amt / course.rack - 1) * 100);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      setCLoading(true);
      setCaddie(null);
      try {
        const text = await getCaddieAdvice(course, auction, amt, abortRef.current.signal);
        setCaddie(text);
      } catch { /* aborted */ }
      setCLoading(false);
    }, 700);
    return () => clearTimeout(debounceRef.current);
  }, [amt, course, auction]);

  const confirm = () => { onConfirm(auction.id, amt); setDone(true); };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#0c100b", border: "1px solid var(--border-h)",
        borderRadius: 14, width: "100%", maxWidth: 440, overflow: "hidden",
      }}>
        {!done ? (
          <>
            {/* Header */}
            <div style={{ padding: "20px 22px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 600 }}>{course.name}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--dim)", marginTop: 4 }}>
                    {auction.date} · {auction.time} · {auction.players} players
                  </div>
                </div>
                <button onClick={onClose} style={{
                  background: "none", border: "none", color: "var(--dim)",
                  fontSize: 22, padding: "4px 8px",
                }}>
                  ×
                </button>
              </div>
            </div>

            {/* Market snapshot */}
            <div style={{ padding: "16px 22px", display: "flex", gap: 12 }}>
              {[
                ["CURRENT BID", `$${auction.bid}`, "var(--gold)"],
                ["RACK RATE", `$${course.rack}`, "var(--dimmer)"],
                ["BIDS", `${auction.bids}`, "var(--white)"],
                ["ENDS IN", auction.endsIn < 3600 ? `${Math.floor(auction.endsIn / 60)}m` : `${Math.round(auction.endsIn / 3600)}h`, auction.endsIn < 3600 ? "var(--amber)" : "var(--dimmer)"],
              ].map(([label, val, col], i) => (
                <div key={i} style={{
                  flex: 1, background: "rgba(255,255,255,0.03)",
                  borderRadius: 8, padding: "10px 12px", textAlign: "center",
                }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dimmer)", letterSpacing: "1px", marginBottom: 4 }}>
                    {label as string}
                  </div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 16, color: col as string }}>
                    {val as string}
                  </div>
                </div>
              ))}
            </div>

            {/* Bid slider */}
            <div style={{ padding: "8px 22px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dimmer)", letterSpacing: "1px" }}>YOUR BID</span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--dimmer)" }}>$</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 32, color: "var(--gold)", fontWeight: 500 }}>{amt}</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--dimmer)", marginLeft: 6 }}>+{premium}%</span>
                </div>
              </div>

              <input
                type="range"
                min={min}
                max={Math.max(min + 200, auction.bid + 250)}
                step={5}
                value={amt}
                onChange={e => setAmt(Number(e.target.value))}
              />

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dimmer)" }}>${min}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dimmer)" }}>${Math.max(min + 200, auction.bid + 250)}</span>
              </div>

              {/* AI Caddie */}
              <div style={{
                marginTop: 16, padding: "12px 14px", background: "var(--gold-bg)",
                border: "1px solid var(--border-h)", borderRadius: 8,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 14 }}>🏌️</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--gold)", letterSpacing: "1px" }}>AI CADDIE</span>
                </div>
                <div style={{ fontFamily: "var(--serif)", fontSize: 14, color: "var(--dim)", fontStyle: "italic", lineHeight: 1.5 }}>
                  {cLoading ? "Reading the green..." : caddie || "Calculating..."}
                </div>
              </div>

              <button onClick={confirm} style={{
                width: "100%", marginTop: 16, padding: "14px",
                background: "linear-gradient(135deg, var(--gold), #b89a3e)",
                color: "#0a0a0a", border: "none", borderRadius: 8,
                fontFamily: "var(--mono)", fontSize: 13, letterSpacing: "1.5px", fontWeight: 600,
              }}>
                CONFIRM ${amt} BID
              </button>
            </div>
          </>
        ) : (
          <div style={{ padding: "40px 22px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⛳</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 600, marginBottom: 6 }}>
              Bid Placed
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--gold)", marginBottom: 16 }}>
              ${amt} on {course.short}
            </div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--dimmer)", lineHeight: 1.6 }}>
              We'll alert you instantly if you're outbid.
            </div>
            <button onClick={onClose} style={{
              marginTop: 20, padding: "12px 32px",
              background: "none", border: "1px solid var(--border)",
              color: "var(--dim)", borderRadius: 6,
              fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "1px",
            }}>
              CLOSE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── TICKER BAR ─────────────────────────────────────────── */

function TickerBar({ events, auctions }: { events: BidEvent[]; auctions: Auction[] }) {
  if (events.length < 3) return null;
  const items = events.slice(0, 12);
  const doubled = [...items, ...items];

  return (
    <div style={{
      overflow: "hidden", background: "var(--surface)",
      borderBottom: "1px solid var(--border)", padding: "8px 0",
    }}>
      <div style={{
        display: "flex", gap: 32, whiteSpace: "nowrap",
        animation: "tickerScroll 30s linear infinite",
        width: "max-content",
      }}>
        {doubled.map((e, i) => {
          const a = auctions.find(x => x.id === e.auctionId);
          const c = COURSES.find(x => x.id === a?.courseId);
          return (
            <span key={i} style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dimmer)" }}>
              <span style={{ color: e.type === "user_bid" ? "var(--gold)" : "var(--green)" }}>
                ${e.amount.toLocaleString()}
              </span>
              {" "}on {c?.short} by {e.bidder}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ── TeeStrike LOGO SVGs ────────────────────────────────── */

function TeeStrikeLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {/* Circle icon */}
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="15" stroke="var(--gold)" strokeWidth="1.5" />
        <path d="M16 8 L16 20 M13 20 L19 20" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="16" cy="7" r="2.5" fill="var(--white)" />
      </svg>
      {/* Wordmark */}
      <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 600, letterSpacing: "1px" }}>
        <span style={{ color: "var(--white)" }}>TEE</span>
        <span style={{ color: "var(--gold)" }}>STRIKE</span>
      </div>
    </div>
  );
}

/* ── MAIN APP ───────────────────────────────────────────── */

export default function TeeStrike() {
  const { auctions, events, outbidAlert, placeBid } = useLiveAuctions(mkAuctions());
  const [bidTarget, setBidTarget] = useState<Auction | null>(null);
  const [dismissOutbid, setDismissOutbid] = useState(false);
  const [filter, setFilter] = useState("ALL");

  const handleConfirm = (id: number, amt: number) => {
    placeBid(id, amt);
    setBidTarget(null);
  };

  const bidAuction = bidTarget ? auctions.find(a => a.id === bidTarget.id) : null;

  const filtered = auctions.filter(a => {
    if (filter === "CLOSING") return a.endsIn < 3600;
    if (filter === "4-SOME") return a.players === 4;
    if (filter === "2-SOME") return a.players === 2;
    return true;
  });

  const showOutbid = outbidAlert && !dismissOutbid;

  useEffect(() => { if (outbidAlert) setDismissOutbid(false); }, [outbidAlert]);

  return (
    <>
      <style>{css}</style>

      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        {/* NAV */}
        <nav style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 24px", borderBottom: "1px solid var(--border)",
          background: "var(--surface)",
        }}>
          <TeeStrikeLogo />
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              fontFamily: "var(--mono)", fontSize: 11, color: "var(--green)",
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "var(--green)", animation: "tsPulse 2s ease infinite",
              }} />
              LIVE
            </div>
            {/* Avatar */}
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "var(--fairway)", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontFamily: "var(--mono)", fontSize: 12, color: "var(--gold)",
              border: "1px solid var(--border-h)",
            }}>
              TS
            </div>
          </div>
        </nav>

        {/* TICKER */}
        <TickerBar events={events} auctions={auctions} />

        {/* OUTBID ALERT */}
        {showOutbid && outbidAlert && (
          <OutbidBanner
            alert={outbidAlert}
            auctions={auctions}
            onRebid={(a) => { setBidTarget(a); setDismissOutbid(true); }}
            onDismiss={() => setDismissOutbid(true)}
          />
        )}

        {/* MAIN */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          {/* Hero */}
          <div style={{ padding: "40px 0 24px" }}>
            <h1 style={{
              fontFamily: "var(--serif)", fontSize: "clamp(28px, 5vw, 44px)",
              fontWeight: 300, lineHeight: 1.2, color: "var(--white)",
            }}>
              Premium Tee Times,{" "}
              <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Auctioned Live</span>
            </h1>
            <p style={{
              fontFamily: "var(--mono)", fontSize: 13, color: "var(--dimmer)",
              marginTop: 10, letterSpacing: "0.5px", maxWidth: 500,
            }}>
              Bid on exclusive tee times at DFW's finest courses. Real-time auctions. AI-powered bidding advice.
            </p>
          </div>

          {/* Layout: cards + feed */}
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
            {/* Left: auction cards */}
            <div style={{ flex: "1 1 0", minWidth: 0 }}>
              {/* Filters */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                {["ALL", "CLOSING", "4-SOME", "2-SOME"].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      background: filter === f ? "var(--gold-bg)" : "transparent",
                      border: `1px solid ${filter === f ? "var(--border-h)" : "var(--border)"}`,
                      color: filter === f ? "var(--gold)" : "var(--dimmer)",
                      borderRadius: 6, padding: "6px 14px",
                      fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "1px",
                      transition: "all 0.2s",
                    }}
                  >
                    {f === "CLOSING" ? "⏱ CLOSING SOON" : f}
                  </button>
                ))}
              </div>

              {/* Cards */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 16,
              }}>
                {filtered.map((a, i) => {
                  const c = COURSES.find(x => x.id === a.courseId)!;
                  return (
                    <AuctionCard
                      key={a.id}
                      auction={a}
                      course={c}
                      onBid={(auction) => setBidTarget(auction)}
                      style={{ animationDelay: `${i * 0.08}s` }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Right: live feed (hidden on mobile) */}
            <div style={{
              width: 320, flexShrink: 0,
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 10, overflow: "hidden",
              position: "sticky", top: 20,
              display: "none",
            }}
              className="feed-sidebar"
            >
              <div style={{
                padding: "14px 16px", borderBottom: "1px solid var(--border)",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: "var(--green)", animation: "tsPulse 2s ease infinite",
                }} />
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "1px", color: "var(--dim)" }}>
                  LIVE ACTIVITY
                </span>
              </div>
              <div style={{ maxHeight: 500, overflowY: "auto" }}>
                <LiveFeed events={events} auctions={auctions} />
              </div>

              {/* Stats */}
              <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {[
                    ["LIVE", auctions.filter(a => a.endsIn > 0).length, "var(--white)"],
                    ["AVG +%", "+" + Math.round(auctions.reduce((s, a) => {
                      const c = COURSES.find(x => x.id === a.courseId)!;
                      return s + (a.bid / c.rack - 1) * 100;
                    }, 0) / auctions.length) + "%", "var(--gold)"],
                    ["BIDS", events.length, "var(--white)"],
                  ].map(([l, v, c], i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dimmer)", letterSpacing: "1px" }}>
                        {l as string}
                      </div>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 16, color: c as string, marginTop: 2 }}>
                        {v as React.ReactNode}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive: show feed sidebar on desktop */}
      <style>{`
        @media (min-width: 900px) {
          .feed-sidebar { display: block !important; }
        }
      `}</style>

      {/* BID MODAL */}
      {bidAuction && (
        <BidModal
          auction={bidAuction}
          course={COURSES.find(c => c.id === bidAuction.courseId)!}
          onClose={() => setBidTarget(null)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
