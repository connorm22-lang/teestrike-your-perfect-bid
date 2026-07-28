import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { COURSES, TEE_TIMES_BY_COURSE } from "../data";

export default defineTool({
  name: "list_courses",
  title: "List courses",
  description:
    "List every golf course on the TeeStrike marketplace with its rack rate, location, and number of open tee time auctions.",
  inputSchema: {
    maxRackRate: z
      .number()
      .positive()
      .optional()
      .describe("Only return courses whose rack rate per player is at or below this dollar amount."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ maxRackRate }) => {
    const courses = COURSES.filter((c) => (maxRackRate ? c.rack <= maxRackRate : true)).map((c) => ({
      id: c.id,
      name: c.name,
      location: c.loc,
      tag: c.tag,
      rackRate: c.rack,
      summary: c.desc,
      openAuctions: TEE_TIMES_BY_COURSE[c.id]?.slots.length ?? 0,
    }));

    return {
      content: [{ type: "text", text: JSON.stringify(courses, null, 2) }],
      structuredContent: { courses },
    };
  },
});
