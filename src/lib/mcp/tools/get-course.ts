import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { findCourse, TEE_TIMES_BY_COURSE } from "../data";

export default defineTool({
  name: "get_course",
  title: "Get course details",
  description:
    "Get the full profile of one TeeStrike course: description, designer, yardage, par, amenities, rack rate, and its auction date.",
  inputSchema: {
    course: z.string().min(1).describe("Course name (partial match allowed) or numeric course id."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ course }) => {
    const found = findCourse(course);
    if (!found) {
      return { content: [{ type: "text", text: `No course matched "${course}".` }], isError: true };
    }

    const detail = {
      id: found.id,
      name: found.name,
      location: found.loc,
      tag: found.tag,
      rackRate: found.rack,
      summary: found.desc,
      description: found.longDesc,
      designer: found.designer,
      established: found.established,
      yardage: found.yardage,
      par: found.par,
      amenities: found.amenities,
      auctionDate: TEE_TIMES_BY_COURSE[found.id]?.date ?? null,
      openAuctions: TEE_TIMES_BY_COURSE[found.id]?.slots.length ?? 0,
    };

    return {
      content: [{ type: "text", text: JSON.stringify(detail, null, 2) }],
      structuredContent: { course: detail },
    };
  },
});
