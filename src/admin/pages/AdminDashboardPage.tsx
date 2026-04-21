import { useCourseAdmin } from "../CourseAdminContext";

const STATS = [
  { label: "Live Auctions", value: "3", sub: "Bidding now", tone: "" as const },
  { label: "Auctions This Week", value: "8", sub: "Listed", tone: "" as const },
  { label: "Revenue This Month", value: "$2,340", sub: "Gross · paid to course", tone: "gold" as const },
  { label: "Avg Premium", value: "+47%", sub: "Above rack rate", tone: "green" as const },
];

const ACTIVITY = [
  { time: "2 min ago", text: <>New bid · <strong>$95</strong> on Saturday 8:30 AM · 4 bidders</>, dot: "" },
  { time: "14 min ago", text: <>Auction closed · Sat 9:00 AM · <strong>$124</strong> (premium $17)</>, dot: "green" },
  { time: "1 hr ago", text: <>New bid · <strong>$84</strong> on Saturday 8:30 AM · 3 bidders</>, dot: "" },
  { time: "3 hr ago", text: <>Slot listed · Sunday 7:30 AM foursome</>, dot: "dim" },
  { time: "Yesterday", text: <>Payout sent · <strong>$112</strong> to connected account</>, dot: "green" },
];

export default function AdminDashboardPage() {
  const { courseName } = useCourseAdmin();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const courseFirstWord = courseName.split(" ")[0];

  return (
    <div>
      <h1 className="serif">
        Good morning, <em>{courseFirstWord}.</em>
      </h1>
      <div className="subtitle-mono">{today}</div>

      <div className="stat-grid">
        {STATS.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-value ${s.tone}`}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="section-label">Recent Activity</div>
      <div className="activity">
        {ACTIVITY.map((a, i) => (
          <div className="activity-row" key={i}>
            <div className="activity-time">{a.time}</div>
            <div className={`activity-dot ${a.dot}`} />
            <div className="activity-text">{a.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
