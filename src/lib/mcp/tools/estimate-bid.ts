import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { BUYERS_PREMIUM, findCourse, TEE_TIMES_BY_COURSE } from "../data";

export default defineTool({
  name: "estimate_bid_cost",
  title: "Estimate bid cost",
  description:
    "Estimate the all-in cost of a TeeStrike bid: per-player bid, TeeStrike's 14% buyer's premium, group total, and how the bid compares to the course rack rate and the current leading bid.",
  inputSchema: {
    course: z.string().min(1).describe("Course name (partial match allowed) or numeric course id."),
    bidPerPlayer: z.number().positive().describe("Proposed bid amount per player, in dollars."),
    players: z.number().int().min(1).max(4).default(4).describe("Number of players in the group."),
    time: z.string().optional().describe("Optional tee time (e.g. '7:14 AM') to compare against that slot's leading bid."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ course, bidPerPlayer, players, time }) => {
    const found = findCourse(course);
    if (!found) {
      return { content: [{ type: "text", text: `No course matched "${course}".` }], isError: true };
    }

    const entry = TEE_TIMES_BY_COURSE[found.id];
    const slot = time ? entry?.slots.find((s) => s.time.toLowerCase() === time.trim().toLowerCase()) : undefined;
    const leadingBid = slot?.bid ?? (entry ? Math.max(...entry.slots.map((s) => s.bid)) : null);

    const premiumPerPlayer = Math.round(bidPerPlayer * BUYERS_PREMIUM * 100) / 100;
    const totalPerPlayer = Math.round((bidPerPlayer + premiumPerPlayer) * 100) / 100;

    const estimate = {
      course: found.name,
      teeTime: slot?.time ?? null,
      players,
      bidPerPlayer,
      buyersPremiumPerPlayer: premiumPerPlayer,
      allInPerPlayer: totalPerPlayer,
      groupTotal: Math.round(totalPerPlayer * players * 100) / 100,
      rackRate: found.rack,
      vsRackPct: Math.round((bidPerPlayer / found.rack - 1) * 100),
      leadingBid,
      leadsCurrentBid: leadingBid === null ? null : bidPerPlayer > leadingBid,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(estimate, null, 2) }],
      structuredContent: { estimate },
    };
  },
});
