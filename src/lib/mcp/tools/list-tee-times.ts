import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { COURSES, findCourse, formatEndsIn, TEE_TIMES_BY_COURSE } from "../data";

export default defineTool({
  name: "list_tee_times",
  title: "List tee time auctions",
  description:
    "List live tee time auctions with current bid, bid count, group size, and time remaining. Filter by course, group size, or how soon the auction closes.",
  inputSchema: {
    course: z.string().optional().describe("Course name (partial match allowed) or id. Omit to search all courses."),
    players: z.number().int().min(1).max(4).optional().describe("Only slots for this group size."),
    closingWithinHours: z.number().positive().optional().describe("Only auctions closing within this many hours."),
    maxBid: z.number().positive().optional().describe("Only auctions whose current bid per player is at or below this."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ course, players, closingWithinHours, maxBid }) => {
    const targets = course ? [findCourse(course)].filter(Boolean) : COURSES;
    if (course && targets.length === 0) {
      return { content: [{ type: "text", text: `No course matched "${course}".` }], isError: true };
    }

    const teeTimes = targets.flatMap((c) => {
      const entry = TEE_TIMES_BY_COURSE[c!.id];
      if (!entry) return [];
      return entry.slots
        .filter((s) => (players ? s.players === players : true))
        .filter((s) => (closingWithinHours ? s.endsIn <= closingWithinHours * 3600 : true))
        .filter((s) => (maxBid ? s.bid <= maxBid : true))
        .map((s) => ({
          courseId: c!.id,
          courseName: c!.name,
          date: entry.date,
          time: s.time,
          players: s.players,
          currentBid: s.bid,
          bidCount: s.bids,
          rackRate: c!.rack,
          vsRackPct: Math.round((s.bid / c!.rack - 1) * 100),
          closesIn: formatEndsIn(s.endsIn),
        }));
    });

    return {
      content: [{ type: "text", text: JSON.stringify(teeTimes, null, 2) }],
      structuredContent: { teeTimes, count: teeTimes.length },
    };
  },
});
