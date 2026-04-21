import { useState, useEffect, useRef, useCallback, useMemo } from "react";

/* ─────────────────────────────────────────────────────────────
   DESIGN SYSTEM  
   Aesthetic: Dark editorial luxury — think WSJ Magazine meets
   a trading floor. Tight typography, kinetic numbers, tension.
   ───────────────────────────────────────────────────────────── */

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #06140d;
  --bg-deep: #03100a;
  --surface: #0a1d13;
  --card: #0d2418;
  --card-h: #12301f;
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
@keyframes expandIn {
  from { opacity:0; max-height:0; }
  to { opacity:1; max-height:600px; }
}

.bid-bump { animation: numFlip 0.25s ease forwards; }
.outbid-shake { animation: shake 0.4s ease; }
.bid-row-flash { animation: bidFlash 0.8s ease forwards; }
.card-in { animation: cardIn 0.4s ease both; }
.expand-in { animation: expandIn 0.3s ease both; overflow: hidden; }

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

input[type=text], input[type=search] {
  font-family: var(--mono);
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  color: var(--white);
  border-radius: 8px;
  padding: 12px 14px;
  outline: none;
  transition: border-color 0.2s;
}
input[type=text]:focus, input[type=search]:focus {
  border-color: var(--border-h);
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
  longDesc: string;
  rack: number;
  img: string;
  tag: string;
  yardage: number;
  par: number;
  designer: string;
  established: number;
  amenities: string[];
}

const COURSES: Course[] = [
  {
    id: 1, name: "Fields Ranch East", short: "Fields Ranch", loc: "Frisco · PGA HQ",
    desc: "PGA of America's championship-ready masterpiece. Firm, fast greens that punish mediocre approaches.",
    longDesc: "Home of the PGA of America's new headquarters, Fields Ranch East is a Gil Hanse design that has already hosted the KitchenAid Senior PGA Championship. Wide fairways invite aggressive play but the bentgrass greens — among the firmest and fastest in Texas — demand pinpoint approaches. Expect 20+ mph crosswinds and elevation changes that play with depth perception.",
    rack: 295, img: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600&h=400&fit=crop", tag: "PGA HQ",
    yardage: 7868, par: 72, designer: "Gil Hanse", established: 2023,
    amenities: ["Caddie Service", "GPS Carts", "Practice Range", "Short Game Area", "PGA Coaching"]
  },
  {
    id: 2, name: "TPC Craig Ranch", short: "Craig Ranch", loc: "McKinney · Tour Venue",
    desc: "Annual PGA Tour stop. Pure bentgrass greens, pristine conditioning year-round.",
    longDesc: "Host of the THE CN Byron Nelson, TPC Craig Ranch delivers a true Tour-caliber test. Tom Weiskopf's design weaves through native grasslands with strategic bunkering and water on 11 holes. The signature par-3 17th plays over a lake to a peninsula green — pure theater. Conditioning is famously immaculate.",
    rack: 245, img: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600&h=400&fit=crop", tag: "Tour",
    yardage: 7468, par: 72, designer: "Tom Weiskopf", established: 2003,
    amenities: ["Tour-Grade Range", "Locker Room", "Fine Dining", "Pro Shop", "Forecaddies"]
  },
  {
    id: 3, name: "Cowboys Golf Club", short: "Cowboys GC", loc: "Grapevine · Dallas",
    desc: "The only NFL-themed golf club in existence. Premium experience with Star-level hospitality.",
    longDesc: "The world's only NFL-themed golf club. Each hole tells a chapter of Dallas Cowboys history with memorabilia tee markers and a clubhouse that doubles as a Cowboys museum. The Jeff Brauer design plays through rolling hills with creek crossings and dramatic bunkering. Service standards rival a five-star resort.",
    rack: 210, img: "https://images.unsplash.com/photo-1592919505780-303950717480?w=600&h=400&fit=crop", tag: "NFL",
    yardage: 7017, par: 72, designer: "Jeff Brauer", established: 2001,
    amenities: ["Cowboys Museum", "Concierge Caddies", "Premium Carts", "Steakhouse", "Cigar Lounge"]
  },
  {
    id: 4, name: "The Tribute", short: "The Tribute", loc: "The Colony · Links",
    desc: "Links-style championship course inspired by the great Scottish and Irish seaside courses.",
    longDesc: "A loving tribute to the British Isles' greatest links. Holes are inspired by St Andrews, Royal Troon, Carnoustie, and Lahinch — pot bunkers, fescue rough, and burns included. Plays along Lewisville Lake giving genuine seaside winds. Bring the bump-and-run; aerial games get punished here.",
    rack: 195, img: "https://images.unsplash.com/photo-1600006195232-1ac2cca26e73?w=600&h=400&fit=crop", tag: "Links",
    yardage: 7002, par: 72, designer: "Tripp Davis", established: 2000,
    amenities: ["Lakeside Range", "Authentic Pot Bunkers", "Caddie Program", "Pub Clubhouse", "Fitting Studio"]
  },
];

interface TeeTimeSlot {
  id: number;
  time: string;
  players: number;
  bid: number;
  bids: number;
  endsIn: number;
}

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

const TEE_TIMES_BY_COURSE: Record<number, { date: string; slots: { time: string; players: number; bid: number; bids: number; endsIn: number }[] }> = {
  1: {
    date: "Sat Apr 5",
    slots: [
      { time: "6:42 AM", players: 4, bid: 310, bids: 4, endsIn: 4800 },
      { time: "7:14 AM", players: 4, bid: 340, bids: 7, endsIn: 5420 },
      { time: "7:46 AM", players: 4, bid: 325, bids: 5, endsIn: 6100 },
      { time: "8:18 AM", players: 2, bid: 290, bids: 3, endsIn: 7200 },
      { time: "9:22 AM", players: 4, bid: 315, bids: 6, endsIn: 9600 },
      { time: "10:30 AM", players: 4, bid: 285, bids: 2, endsIn: 12400 },
    ],
  },
  2: {
    date: "Fri Apr 4",
    slots: [
      { time: "6:18 AM", players: 4, bid: 240, bids: 5, endsIn: 1800 },
      { time: "6:50 AM", players: 4, bid: 260, bids: 9, endsIn: 2180 },
      { time: "7:22 AM", players: 4, bid: 255, bids: 6, endsIn: 2900 },
      { time: "8:04 AM", players: 2, bid: 230, bids: 3, endsIn: 3600 },
      { time: "9:08 AM", players: 4, bid: 250, bids: 4, endsIn: 5400 },
      { time: "11:14 AM", players: 4, bid: 215, bids: 2, endsIn: 12800 },
      { time: "1:42 PM", players: 4, bid: 195, bids: 1, endsIn: 21600 },
    ],
  },
  3: {
    date: "Sun Apr 6",
    slots: [
      { time: "7:00 AM", players: 4, bid: 220, bids: 3, endsIn: 11000 },
      { time: "8:00 AM", players: 4, bid: 225, bids: 2, endsIn: 14400 },
      { time: "8:32 AM", players: 4, bid: 235, bids: 4, endsIn: 15200 },
      { time: "9:16 AM", players: 2, bid: 210, bids: 2, endsIn: 16800 },
      { time: "10:48 AM", players: 4, bid: 215, bids: 1, endsIn: 21600 },
    ],
  },
  4: {
    date: "Sat Apr 5",
    slots: [
      { time: "8:14 AM", players: 4, bid: 205, bids: 3, endsIn: 7200 },
      { time: "9:30 AM", players: 2, bid: 215, bids: 4, endsIn: 8600 },
      { time: "10:02 AM", players: 4, bid: 200, bids: 2, endsIn: 9800 },
      { time: "11:18 AM", players: 4, bid: 195, bids: 2, endsIn: 12000 },
      { time: "12:50 PM", players: 2, bid: 185, bids: 1, endsIn: 18400 },
      { time: "2:24 PM", players: 4, bid: 175, bids: 1, endsIn: 24000 },
    ],
  },
};

const mkAuctions = (): Auction[] => {
  let id = 1;
  const out: Auction[] = [];
  for (const courseId of Object.keys(TEE_TIMES_BY_COURSE).map(Number)) {
    const { date, slots } = TEE_TIMES_BY_COURSE[courseId];
    for (const s of slots) {
      out.push({ id: id++, courseId, date, ...s });
    }
  }
  return out;
};

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

  return { auctions, events, outbidAlert, placeBid, userBidsRef };
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
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const fallbackAdvice = () => {
    const premium = Math.round((bidAmount / course.rack - 1) * 100);
    const timeLeft = auction.endsIn < 3600 ? `${Math.floor(auction.endsIn / 60)} minutes` : `${Math.round(auction.endsIn / 3600)} hours`;
    if (premium < 10) return `${course.short} at only +${premium}% is a steal — expect someone to contest this before the ${timeLeft} close. Lock it now.`;
    if (premium < 20) return `Solid read. +${premium}% on ${course.short} is right in the zone where serious golfers commit. ${auction.bids} bids means real demand.`;
    if (premium < 35) return `You're paying for access, not just a tee time. ${course.short} is worth the premium if you value the experience. ${timeLeft} left.`;
    return `Bold. +${premium}% on ${course.short} sends a message. ${auction.bids} other people want this time slot — make it count.`;
  };

  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/caddie`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({ course, auction, bidAmount }),
      signal,
    });

    if (!res.ok) return fallbackAdvice();
    const data = await res.json();
    return data.advice || fallbackAdvice();
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    return fallbackAdvice();
  }
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

/* ── TEE TIME ROW ───────────────────────────────────────── */

function TeeTimeRow({ auction, onBid }: { auction: Auction; onBid: (a: Auction) => void }) {
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

  const isLeading = auction._userLeading;
  const isFlash = auction._flash;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={(e) => { e.stopPropagation(); onBid(auction); }}
      style={{
        display: "grid",
        gridTemplateColumns: "70px 1fr auto auto auto",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        background: isFlash ? "rgba(212,175,55,0.08)" : hov ? "rgba(255,255,255,0.04)" : "transparent",
        borderTop: "1px solid var(--border)",
        cursor: "pointer",
        transition: "background 0.2s",
      }}
    >
      <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--white)", fontWeight: 500 }}>
        {auction.time}
      </span>
      <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dim)" }}>
        {auction.players}p · {auction.bids} bid{auction.bids !== 1 ? "s" : ""}
      </span>
      <Countdown seconds={auction.endsIn} />
      <span className={bumped ? "bid-bump" : ""} style={{
        fontFamily: "var(--mono)", fontSize: 15, fontWeight: 500,
        color: isLeading ? "var(--green)" : "var(--gold)",
        minWidth: 56, textAlign: "right",
      }}>
        ${auction.bid}
      </span>
      <span style={{
        fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "1px",
        color: hov ? "var(--gold)" : "var(--dimmer)",
        padding: "4px 8px", border: `1px solid ${hov ? "var(--border-h)" : "var(--border)"}`,
        borderRadius: 4, transition: "all 0.2s",
      }}>
        {isLeading ? "LEADING" : "BID"}
      </span>
    </div>
  );
}

/* ── COURSE CARD (with multiple tee times) ──────────────── */

function CourseCard({ course, auctions, onBid, style }: {
  course: Course;
  auctions: Auction[];
  onBid: (a: Auction) => void;
  style?: React.CSSProperties;
}) {
  const [hov, setHov] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const sortedAuctions = useMemo(
    () => [...auctions].sort((a, b) => a.endsIn - b.endsIn),
    [auctions]
  );

  if (!sortedAuctions.length) return null;

  const minBid = Math.min(...sortedAuctions.map(a => a.bid));
  const totalBids = sortedAuctions.reduce((s, a) => s + a.bids, 0);
  const date = sortedAuctions[0].date;

  return (
    <div
      className="card-in"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "var(--card-h)" : "var(--card)",
        border: `1px solid ${hov ? "var(--border-h)" : "var(--border)"}`,
        borderRadius: 10, overflow: "hidden", transition: "all 0.2s ease",
        ...style,
      }}
    >
      {/* Image — clickable to expand */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{ position: "relative", height: 170, overflow: "hidden", cursor: "pointer" }}
      >
        <img
          src={course.img}
          alt={course.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s", transform: hov ? "scale(1.05)" : "scale(1)" }}
        />
        <div style={{
          position: "absolute", top: 10, left: 10,
          fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "1px",
          padding: "3px 8px", borderRadius: 4,
          background: "var(--gold-bg)", color: "var(--gold)",
          border: "1px solid var(--border-h)",
        }}>
          {course.tag}
        </div>
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
          padding: "26px 14px 10px",
        }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 600, color: "var(--white)", lineHeight: 1.1 }}>
            {course.name}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
            <span style={{ fontSize: 11, color: "var(--dim)", fontFamily: "var(--mono)" }}>
              {course.loc}
            </span>
            <span style={{ fontSize: 10, color: "var(--gold)", fontFamily: "var(--mono)", letterSpacing: "1px" }}>
              {expanded ? "− DETAILS" : "+ DETAILS"}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable description */}
      {expanded && (
        <div className="expand-in" style={{
          padding: "14px 16px",
          background: "var(--bg-deep)",
          borderTop: "1px solid var(--border)",
        }}>
          <p style={{
            fontFamily: "var(--serif)", fontSize: 14, color: "var(--dim)",
            lineHeight: 1.55, fontStyle: "italic", marginBottom: 12,
          }}>
            {course.longDesc}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
            {[
              ["YARDAGE", course.yardage.toLocaleString()],
              ["PAR", course.par],
              ["DESIGNER", course.designer.split(" ").slice(-1)[0]],
              ["EST.", course.established],
            ].map(([l, v], i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--dimmer)", letterSpacing: "1px" }}>{l}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--white)", marginTop: 3 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {course.amenities.map(a => (
              <span key={a} style={{
                fontFamily: "var(--mono)", fontSize: 10,
                color: "var(--dim)", padding: "3px 8px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--border)", borderRadius: 4,
              }}>{a}</span>
            ))}
          </div>
        </div>
      )}

      {/* Header strip */}
      <div style={{
        padding: "12px 14px 8px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dimmer)", letterSpacing: "1px" }}>
            {date.toUpperCase()} · {sortedAuctions.length} TEE TIMES
          </div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dim)", marginTop: 3 }}>
            From <span style={{ color: "var(--gold)" }}>${minBid}</span> · {totalBids} total bids · rack ${course.rack}
          </div>
        </div>
      </div>

      {/* Tee time list */}
      <div style={{ paddingBottom: 6 }}>
        {sortedAuctions.map(a => (
          <TeeTimeRow key={a.id} auction={a} onBid={onBid} />
        ))}
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
        background: "var(--card)", border: "1px solid var(--border-h)",
        borderRadius: 14, width: "100%", maxWidth: 440, overflow: "hidden",
      }}>
        {!done ? (
          <>
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
                }}>×</button>
              </div>
            </div>

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

/* ── LOGO ──────────────────────────────────────────────── */

function TeeStrikeLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="15" stroke="var(--gold)" strokeWidth="1.5" />
        <path d="M16 8 L16 20 M13 20 L19 20" stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="16" cy="7" r="2.5" fill="var(--white)" />
      </svg>
      <div style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 600, letterSpacing: "1px" }}>
        <span style={{ color: "var(--white)" }}>TEE</span>
        <span style={{ color: "var(--gold)" }}>STRIKE</span>
      </div>
    </div>
  );
}

/* ── SEARCH PAGE ───────────────────────────────────────── */

type SearchFilters = {
  q: string;
  closingSoon: boolean;
  fourSome: boolean;
  twoSome: boolean;
  morning: boolean; // before noon
  afternoon: boolean;
  underRack: boolean;
  premiumOnly: boolean; // tag presence
  maxBid: number;
};

const DEFAULT_FILTERS: SearchFilters = {
  q: "", closingSoon: false, fourSome: false, twoSome: false,
  morning: false, afternoon: false, underRack: false, premiumOnly: false, maxBid: 500,
};

function ToggleChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      background: active ? "var(--gold-bg)" : "transparent",
      border: `1px solid ${active ? "var(--border-h)" : "var(--border)"}`,
      color: active ? "var(--gold)" : "var(--dim)",
      borderRadius: 999, padding: "8px 14px",
      fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "1px",
      transition: "all 0.2s",
    }}>
      {children}
    </button>
  );
}

function SearchPage({ auctions, onBid }: { auctions: Auction[]; onBid: (a: Auction) => void }) {
  const [f, setF] = useState<SearchFilters>(DEFAULT_FILTERS);

  const results = useMemo(() => {
    return auctions.filter(a => {
      const c = COURSES.find(x => x.id === a.courseId)!;
      const q = f.q.trim().toLowerCase();
      if (q && !`${c.name} ${c.short} ${c.loc} ${c.tag} ${c.designer}`.toLowerCase().includes(q)) return false;
      if (f.closingSoon && a.endsIn >= 3600) return false;
      if (f.fourSome && a.players !== 4) return false;
      if (f.twoSome && a.players !== 2) return false;
      const hour = parseInt(a.time.split(":")[0]) + (a.time.includes("PM") && !a.time.startsWith("12") ? 12 : 0);
      if (f.morning && hour >= 12) return false;
      if (f.afternoon && hour < 12) return false;
      if (f.underRack && a.bid >= c.rack) return false;
      if (f.premiumOnly && !["PGA HQ", "Tour", "NFL"].includes(c.tag)) return false;
      if (a.bid > f.maxBid) return false;
      return true;
    });
  }, [auctions, f]);

  const activeCount = (Object.keys(f) as (keyof SearchFilters)[])
    .filter(k => k !== "q" && k !== "maxBid")
    .filter(k => f[k] === true).length + (f.q ? 1 : 0) + (f.maxBid < 500 ? 1 : 0);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 60px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "clamp(28px,4vw,38px)", fontWeight: 300, lineHeight: 1.1 }}>
          Search <span style={{ color: "var(--gold)", fontStyle: "italic" }}>Tee Times</span>
        </h1>
        <p style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--dimmer)", marginTop: 8, letterSpacing: "0.5px" }}>
          Filter by course, time, format, and price. {activeCount > 0 && <span style={{ color: "var(--gold)" }}>{activeCount} filter{activeCount !== 1 ? "s" : ""} active</span>}
        </p>
      </div>

      {/* Search input */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="search"
          placeholder="Search courses, locations, designers..."
          value={f.q}
          onChange={e => setF({ ...f, q: e.target.value })}
          style={{ width: "100%", fontSize: 14 }}
        />
      </div>

      {/* Toggles */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <ToggleChip active={f.closingSoon} onClick={() => setF({ ...f, closingSoon: !f.closingSoon })}>⏱ CLOSING SOON</ToggleChip>
        <ToggleChip active={f.fourSome} onClick={() => setF({ ...f, fourSome: !f.fourSome, twoSome: false })}>4-SOME</ToggleChip>
        <ToggleChip active={f.twoSome} onClick={() => setF({ ...f, twoSome: !f.twoSome, fourSome: false })}>2-SOME</ToggleChip>
        <ToggleChip active={f.morning} onClick={() => setF({ ...f, morning: !f.morning, afternoon: false })}>☀ MORNING</ToggleChip>
        <ToggleChip active={f.afternoon} onClick={() => setF({ ...f, afternoon: !f.afternoon, morning: false })}>🌤 AFTERNOON</ToggleChip>
        <ToggleChip active={f.underRack} onClick={() => setF({ ...f, underRack: !f.underRack })}>UNDER RACK</ToggleChip>
        <ToggleChip active={f.premiumOnly} onClick={() => setF({ ...f, premiumOnly: !f.premiumOnly })}>★ PREMIUM ONLY</ToggleChip>
        {activeCount > 0 && (
          <button onClick={() => setF(DEFAULT_FILTERS)} style={{
            background: "none", border: "1px dashed var(--border)",
            color: "var(--dim)", borderRadius: 999, padding: "8px 14px",
            fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "1px",
          }}>CLEAR ALL</button>
        )}
      </div>

      {/* Max bid slider */}
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: 10, padding: "14px 18px", marginBottom: 24,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dimmer)", letterSpacing: "1px" }}>MAX BID</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 14, color: "var(--gold)" }}>${f.maxBid}</span>
        </div>
        <input type="range" min={100} max={500} step={10} value={f.maxBid} onChange={e => setF({ ...f, maxBid: Number(e.target.value) })} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dimmer)" }}>$100</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dimmer)" }}>$500</span>
        </div>
      </div>

      {/* Results */}
      <div style={{ marginBottom: 14, fontFamily: "var(--mono)", fontSize: 11, color: "var(--dimmer)", letterSpacing: "1px" }}>
        {results.length} TEE TIME{results.length !== 1 ? "S" : ""} MATCH
      </div>

      {results.length === 0 ? (
        <div style={{
          padding: 60, textAlign: "center",
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: 10, color: "var(--dim)", fontFamily: "var(--serif)",
          fontSize: 18, fontStyle: "italic",
        }}>
          No tee times match your filters. Try widening your search.
        </div>
      ) : (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          {results.map(a => {
            const c = COURSES.find(x => x.id === a.courseId)!;
            return (
              <div key={a.id} onClick={() => onBid(a)} style={{
                display: "grid",
                gridTemplateColumns: "60px 1fr auto auto auto",
                alignItems: "center", gap: 14,
                padding: "14px 16px", borderBottom: "1px solid var(--border)",
                cursor: "pointer", transition: "background 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <img src={c.img} alt={c.name} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6 }} />
                <div>
                  <div style={{ fontFamily: "var(--serif)", fontSize: 17, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dim)", marginTop: 2 }}>
                    {a.date} · {a.time} · {a.players}p · {c.loc}
                  </div>
                </div>
                <Countdown seconds={a.endsIn} />
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 16, color: "var(--gold)" }}>${a.bid}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dimmer)" }}>{a.bids} bids</div>
                </div>
                <span style={{
                  fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "1px",
                  color: "var(--gold)", padding: "6px 12px",
                  border: "1px solid var(--border-h)", borderRadius: 4,
                }}>BID</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── PROFILE PAGE ──────────────────────────────────────── */

function ProfilePage({ auctions, events, userBids }: {
  auctions: Auction[];
  events: BidEvent[];
  userBids: Record<number, number>;
}) {
  const userAuctions = auctions.filter(a => userBids[a.id] !== undefined);
  const leading = userAuctions.filter(a => a._userLeading).length;
  const outbid = userAuctions.length - leading;
  const totalCommitted = userAuctions.reduce((s, a) => s + (userBids[a.id] || 0) * a.players, 0);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 60px" }}>
      {/* Profile header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 20,
        background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: 14, padding: "24px 28px", marginBottom: 28,
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "linear-gradient(135deg, var(--fairway), var(--green-dark))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--serif)", fontSize: 32, fontWeight: 600, color: "var(--gold)",
          border: "2px solid var(--border-h)",
        }}>
          TS
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--serif)", fontSize: 28, fontWeight: 600 }}>Taylor Strickland</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--dim)", marginTop: 4 }}>
            taylor@teestrike.com · Member since Mar 2024
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <span style={{
              fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "1px",
              padding: "4px 10px", borderRadius: 999,
              background: "var(--gold-bg)", color: "var(--gold)",
              border: "1px solid var(--border-h)",
            }}>★ PLATINUM</span>
            <span style={{
              fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "1px",
              padding: "4px 10px", borderRadius: 999,
              background: "var(--green-bg)", color: "var(--green)",
              border: "1px solid var(--green-border)",
            }}>HCP 8.4</span>
          </div>
        </div>
        <button style={{
          background: "none", border: "1px solid var(--border)",
          color: "var(--dim)", padding: "10px 18px", borderRadius: 8,
          fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "1px",
        }}>
          EDIT PROFILE
        </button>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 14, marginBottom: 28 }}>
        {[
          ["ACTIVE BIDS", userAuctions.length, "var(--white)"],
          ["LEADING", leading, "var(--green)"],
          ["OUTBID", outbid, "var(--red)"],
          ["COMMITTED", `$${totalCommitted.toLocaleString()}`, "var(--gold)"],
        ].map(([l, v, c], i) => (
          <div key={i} style={{
            background: "var(--card)", border: "1px solid var(--border)",
            borderRadius: 10, padding: "18px 20px",
          }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dimmer)", letterSpacing: "1px" }}>{l}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 26, fontWeight: 500, color: c as string, marginTop: 6 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* My active bids */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 600, marginBottom: 14 }}>My Active Bids</h2>
        {userAuctions.length === 0 ? (
          <div style={{
            padding: 40, textAlign: "center",
            background: "var(--card)", border: "1px dashed var(--border)",
            borderRadius: 10, color: "var(--dim)", fontFamily: "var(--serif)",
            fontStyle: "italic", fontSize: 16,
          }}>
            No active bids yet. Head to the marketplace and stake your claim.
          </div>
        ) : (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
            {userAuctions.map(a => {
              const c = COURSES.find(x => x.id === a.courseId)!;
              const isLeading = a._userLeading;
              return (
                <div key={a.id} style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto auto",
                  alignItems: "center", gap: 14,
                  padding: "14px 16px", borderBottom: "1px solid var(--border)",
                }}>
                  <div>
                    <div style={{ fontFamily: "var(--serif)", fontSize: 16, fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--dim)", marginTop: 2 }}>
                      {a.date} · {a.time} · {a.players}p
                    </div>
                  </div>
                  <Countdown seconds={a.endsIn} />
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--dimmer)" }}>YOUR BID</div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 16, color: "var(--gold)" }}>${userBids[a.id]}</div>
                  </div>
                  <span style={{
                    fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "1px",
                    padding: "5px 10px", borderRadius: 4,
                    background: isLeading ? "var(--green-bg)" : "var(--red-bg)",
                    color: isLeading ? "var(--green)" : "var(--red)",
                    border: `1px solid ${isLeading ? "var(--green-border)" : "var(--red)"}`,
                  }}>{isLeading ? "LEADING" : "OUTBID"}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preferences */}
      <div>
        <h2 style={{ fontFamily: "var(--serif)", fontSize: 22, fontWeight: 600, marginBottom: 14 }}>Preferences</h2>
        <div style={{
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: 10, padding: "18px 22px",
        }}>
          {[
            ["Outbid notifications", "Instant push + email"],
            ["Preferred tee time", "Before 9:00 AM"],
            ["Default group size", "Foursome"],
            ["AI Caddie", "Enabled"],
            ["Payment method", "Visa •••• 4429"],
          ].map(([k, v], i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 0", borderTop: i === 0 ? "none" : "1px solid var(--border)",
            }}>
              <span style={{ fontFamily: "var(--sans)", fontSize: 14, color: "var(--white)" }}>{k}</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--dim)" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── MARKETPLACE PAGE ──────────────────────────────────── */

function MarketplacePage({ auctions, events, onBid }: {
  auctions: Auction[];
  events: BidEvent[];
  onBid: (a: Auction) => void;
}) {
  const [filter, setFilter] = useState("ALL");

  const filtered = auctions.filter(a => {
    if (filter === "CLOSING") return a.endsIn < 3600;
    if (filter === "4-SOME") return a.players === 4;
    if (filter === "2-SOME") return a.players === 2;
    return true;
  });

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
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

      <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 0", minWidth: 0 }}>
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

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
            gap: 18,
          }}>
            {COURSES.map((course, i) => {
              const courseAuctions = filtered.filter(a => a.courseId === course.id);
              if (!courseAuctions.length) return null;
              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  auctions={courseAuctions}
                  onBid={onBid}
                  style={{ animationDelay: `${i * 0.08}s` }}
                />
              );
            })}
          </div>
        </div>

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
  );
}

/* ── MAIN APP ───────────────────────────────────────────── */

type Tab = "MARKET" | "SEARCH" | "PROFILE";

export default function TeeStrike() {
  const { auctions, events, outbidAlert, placeBid, userBidsRef } = useLiveAuctions(mkAuctions());
  const [bidTarget, setBidTarget] = useState<Auction | null>(null);
  const [dismissOutbid, setDismissOutbid] = useState(false);
  const [tab, setTab] = useState<Tab>("MARKET");

  const handleConfirm = (id: number, amt: number) => {
    placeBid(id, amt);
    setBidTarget(null);
  };

  const bidAuction = bidTarget ? auctions.find(a => a.id === bidTarget.id) : null;
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

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4 }}>
            {(["MARKET", "SEARCH", "PROFILE"] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: tab === t ? "var(--gold-bg)" : "transparent",
                border: `1px solid ${tab === t ? "var(--border-h)" : "transparent"}`,
                color: tab === t ? "var(--gold)" : "var(--dim)",
                borderRadius: 6, padding: "8px 16px",
                fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "1.5px",
                transition: "all 0.2s",
              }}>{t}</button>
            ))}
          </div>

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
            <button
              onClick={() => setTab("PROFILE")}
              style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "var(--fairway)", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontFamily: "var(--mono)", fontSize: 12, color: "var(--gold)",
                border: "1px solid var(--border-h)",
              }}>
              TS
            </button>
          </div>
        </nav>

        <TickerBar events={events} auctions={auctions} />

        {showOutbid && outbidAlert && (
          <OutbidBanner
            alert={outbidAlert}
            auctions={auctions}
            onRebid={(a) => { setBidTarget(a); setDismissOutbid(true); }}
            onDismiss={() => setDismissOutbid(true)}
          />
        )}

        {tab === "MARKET" && <MarketplacePage auctions={auctions} events={events} onBid={setBidTarget} />}
        {tab === "SEARCH" && <SearchPage auctions={auctions} onBid={setBidTarget} />}
        {tab === "PROFILE" && <ProfilePage auctions={auctions} events={events} userBids={userBidsRef.current} />}
      </div>

      <style>{`
        @media (min-width: 1100px) {
          .feed-sidebar { display: block !important; }
        }
      `}</style>

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
