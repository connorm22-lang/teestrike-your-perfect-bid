import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCourseAdmin } from "../CourseAdminContext";

type Tx = {
  id: string;
  bid: number;
  premium: number;
  total: number;
  status: string;
  created: string;
};

export default function AdminTransactionsPage() {
  const { courseId } = useCourseAdmin();
  const [rows, setRows] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) return;
    let active = true;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("transactions")
        .select("id, winning_bid, buyer_premium, total_charged, status, created_at")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false });
      if (!active) return;
      setRows(
        (data ?? []).map((t) => ({
          id: t.id,
          bid: Number(t.winning_bid ?? 0),
          premium: Number(t.buyer_premium ?? 0),
          total: Number(t.total_charged ?? 0),
          status: String(t.status).toUpperCase().replace("_", " "),
          created: new Date(t.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        }))
      );
      setLoading(false);
    })();
    return () => { active = false; };
  }, [courseId]);

  const total = rows
    .filter((t) => t.status === "PAID OUT" || t.status === "CAPTURED")
    .reduce((s, t) => s + t.bid, 0);

  function pillClass(status: string) {
    if (status === "PAID OUT" || status === "CAPTURED") return "paid";
    if (status === "FAILED" || status === "REFUNDED") return "failed";
    return "pending";
  }

  return (
    <div>
      <h2 className="serif" style={{ marginBottom: 6 }}>Transactions</h2>
      <div className="subtitle-mono" style={{ marginTop: 0, marginBottom: 24 }}>
        ${total.toLocaleString()} paid to your account · {rows.length} transactions
      </div>

      <div className="table-wrap">
        <table className="t">
          <thead>
            <tr>
              <th>Date</th>
              <th>Winning Bid</th>
              <th>Buyer Premium</th>
              <th>Total Charged</th>
              <th>Your Payout</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="dim mono" style={{ fontSize: 11, letterSpacing: "0.18em" }}>
                  {loading ? "Loading transactions…" : "No transactions yet"}
                </td>
              </tr>
            ) : rows.map((t) => (
              <tr key={t.id}>
                <td className="mono dim">{t.created}</td>
                <td className="mono gold">${t.bid.toLocaleString()}</td>
                <td className="mono dim">${t.premium.toLocaleString()}</td>
                <td className="mono">${t.total.toLocaleString()}</td>
                <td className="mono green">${t.bid.toLocaleString()}</td>
                <td>
                  <span className={`pill ${pillClass(t.status)}`}>
                    <span className="dot" />{t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
