import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listCourses from "./tools/list-courses";
import getCourse from "./tools/get-course";
import listTeeTimes from "./tools/list-tee-times";
import estimateBid from "./tools/estimate-bid";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "teestrike",
  title: "TeeStrike",
  version: "0.1.0",
  instructions:
    "Tools for TeeStrike, a premium golf tee time auction marketplace in the Dallas–Fort Worth area. Use `list_courses` to browse courses, `get_course` for a full course profile, `list_tee_times` to find live tee time auctions (filterable by course, group size, closing window, and max bid), and `estimate_bid_cost` to price a bid including the 14% buyer's premium.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listCourses, getCourse, listTeeTimes, estimateBid],
});
