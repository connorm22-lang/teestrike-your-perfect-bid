/**
 * Public TeeStrike marketplace catalog exposed over MCP.
 * Mirrors the demo data rendered in the consumer app.
 */

export interface McpCourse {
  id: number;
  name: string;
  loc: string;
  desc: string;
  longDesc: string;
  rack: number;
  tag: string;
  yardage: number;
  par: number;
  designer: string;
  established: number;
  amenities: string[];
}

export interface McpSlot {
  time: string;
  players: number;
  bid: number;
  bids: number;
  endsIn: number;
}

export const BUYERS_PREMIUM = 0.14;

export const COURSES: McpCourse[] = [
  {
    id: 1,
    name: "Fields Ranch East",
    loc: "Frisco · PGA HQ",
    desc: "PGA of America's championship-ready masterpiece. Firm, fast greens that punish mediocre approaches.",
    longDesc:
      "Home of the PGA of America's new headquarters, Fields Ranch East is a Gil Hanse design that has already hosted the KitchenAid Senior PGA Championship. Wide fairways invite aggressive play but the bentgrass greens — among the firmest and fastest in Texas — demand pinpoint approaches.",
    rack: 295,
    tag: "PGA HQ",
    yardage: 7868,
    par: 72,
    designer: "Gil Hanse",
    established: 2023,
    amenities: ["Caddie Service", "GPS Carts", "Practice Range", "Short Game Area", "PGA Coaching"],
  },
  {
    id: 2,
    name: "TPC Craig Ranch",
    loc: "McKinney · Tour Venue",
    desc: "Annual PGA Tour stop. Pure bentgrass greens, pristine conditioning year-round.",
    longDesc:
      "Host of the CJ CUP Byron Nelson, TPC Craig Ranch delivers a true Tour-caliber test. Tom Weiskopf's design weaves through native grasslands with strategic bunkering and water on 11 holes. The signature par-3 17th plays over a lake to a peninsula green.",
    rack: 245,
    tag: "Tour",
    yardage: 7468,
    par: 72,
    designer: "Tom Weiskopf",
    established: 2003,
    amenities: ["Tour-Grade Range", "Locker Room", "Fine Dining", "Pro Shop", "Forecaddies"],
  },
  {
    id: 3,
    name: "Cowboys Golf Club",
    loc: "Grapevine · Dallas",
    desc: "The only NFL-themed golf club in existence. Premium experience with Star-level hospitality.",
    longDesc:
      "The world's only NFL-themed golf club. Each hole tells a chapter of Dallas Cowboys history with memorabilia tee markers and a clubhouse that doubles as a Cowboys museum. The Jeff Brauer design plays through rolling hills with creek crossings and dramatic bunkering.",
    rack: 210,
    tag: "NFL",
    yardage: 7017,
    par: 72,
    designer: "Jeff Brauer",
    established: 2001,
    amenities: ["Cowboys Museum", "Concierge Caddies", "Premium Carts", "Steakhouse", "Cigar Lounge"],
  },
  {
    id: 4,
    name: "The Tribute",
    loc: "The Colony · Links",
    desc: "Links-style championship course inspired by the great Scottish and Irish seaside courses.",
    longDesc:
      "A loving tribute to the British Isles' greatest links. Holes are inspired by St Andrews, Royal Troon, Carnoustie, and Lahinch — pot bunkers, fescue rough, and burns included. Plays along Lewisville Lake giving genuine seaside winds.",
    rack: 195,
    tag: "Links",
    yardage: 7002,
    par: 72,
    designer: "Tripp Davis",
    established: 2000,
    amenities: ["Lakeside Range", "Authentic Pot Bunkers", "Caddie Program", "Pub Clubhouse", "Fitting Studio"],
  },
];

export const TEE_TIMES_BY_COURSE: Record<number, { date: string; slots: McpSlot[] }> = {
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

export function findCourse(query: string | number): McpCourse | undefined {
  if (typeof query === "number") return COURSES.find((c) => c.id === query);
  const q = String(query).trim().toLowerCase();
  const asId = Number(q);
  if (!Number.isNaN(asId)) {
    const byId = COURSES.find((c) => c.id === asId);
    if (byId) return byId;
  }
  return COURSES.find((c) => c.name.toLowerCase().includes(q) || c.loc.toLowerCase().includes(q));
}

export function formatEndsIn(seconds: number): string {
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return m ? `${h}h ${m}m` : `${h}h`;
}
