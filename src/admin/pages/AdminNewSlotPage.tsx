import { useState, FormEvent, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCourseAdmin } from "../CourseAdminContext";
import { useAdminToast } from "../useToast";
import { supabase } from "@/integrations/supabase/client";

function pad(n: number) { return String(n).padStart(2, "0"); }

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const LENGTHS = [
  { key: "1", label: "1 day", days: 1 },
  { key: "3", label: "3 days", days: 3 },
  { key: "7", label: "7 days", days: 7 },
];

export default function AdminNewSlotPage() {
  const navigate = useNavigate();
  const { rackRateDefault, courseId, courseName } = useCourseAdmin();
  const { showToast, toastNode } = useAdminToast();

  const [date, setDate] = useState(tomorrowISO());
  const [teeTime, setTeeTime] = useState("08:00");
  const [players, setPlayers] = useState(4);
  const [rack, setRack] = useState(rackRateDefault);
  const [length, setLength] = useState("3");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { setRack(rackRateDefault); }, [rackRateDefault, courseId]);

  const payoutAtRack = rack;
  const payoutAtPremium = useMemo(() => Math.round(rack * 1.3), [rack]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    const next: Record<string, string> = {};
    if (!date) next.date = "Date is required";
    else if (date < todayISO()) next.date = "Tee date must be today or later";
    if (!teeTime) next.teeTime = "Tee time is required";
    if (!rack || rack <= 0) next.rack = "Rack rate must be positive";
    if (!courseId) next.date = "No course selected";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      showToast("Fix the errors below", "error");
      return;
    }

    setSaving(true);
    const days = LENGTHS.find((l) => l.key === length)?.days ?? 3;
    const opensAt = new Date();
    const endsAt = new Date(opensAt.getTime() + days * 24 * 60 * 60 * 1000);

    const { data: slot, error: slotError } = await supabase
      .from("tee_time_slots")
      .insert({
        course_id: courseId as string,
        tee_date: date,
        tee_time: teeTime,
        players,
        rack_rate: rack,
      })
      .select("id")
      .single();

    if (slotError || !slot) {
      setSaving(false);
      setFormError(slotError?.message ?? "Couldn't create the tee time slot.");
      showToast("Couldn't create the tee time", "error");
      return;
    }

    const { error: auctionError } = await supabase.from("auctions").insert({
      slot_id: slot.id,
      course_id: courseId as string,
      tee_date: date,
      tee_time: teeTime,
      players,
      rack_rate: rack,
      floor_price: rack,
      bid_increment: 5.0,
      opens_at: opensAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: "live" as const,
      buyer_premium_pct: 0.14,
    });

    setSaving(false);

    if (auctionError) {
      setFormError(auctionError.message);
      showToast("Slot saved but the auction failed to open", "error");
      return;
    }

    showToast(`Auction is live — closes in ${days} day${days > 1 ? "s" : ""}`);
    setTimeout(() => navigate("/admin/auctions"), 800);
  }

  return (
    <div>
      <h2 className="serif" style={{ marginBottom: 6 }}>List a Tee Time</h2>
      <div className="subtitle-mono" style={{ marginTop: 0, marginBottom: 28 }}>
        {courseName ? `${courseName} · ` : ""}This will open a live auction
      </div>

      <form className="form" onSubmit={submit}>
        <div className="form-card">
          <div className="field">
            <label className="field-label">Date</label>
            <input type="date" value={date} min={todayISO()} onChange={(e) => setDate(e.target.value)} />
            {errors.date && <div className="field-error">{errors.date}</div>}
          </div>

          <div className="field">
            <label className="field-label">Tee Time</label>
            <input type="time" value={teeTime} onChange={(e) => setTeeTime(e.target.value)} />
            {errors.teeTime && <div className="field-error">{errors.teeTime}</div>}
          </div>

          <div className="field">
            <label className="field-label">Players</label>
            <div className="radio-group">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`radio-pill ${players === n ? "selected" : ""}`}
                  onClick={() => setPlayers(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="field-label">Rack Rate ($) · auction floor</label>
            <input type="number" value={rack} min={1}
              onChange={(e) => setRack(Number(e.target.value))} />
            {errors.rack && <div className="field-error">{errors.rack}</div>}
          </div>

          <div className="field">
            <label className="field-label">Auction Length</label>
            <div className="radio-group">
              {LENGTHS.map((l) => (
                <button
                  key={l.key}
                  type="button"
                  className={`radio-pill ${length === l.key ? "selected" : ""}`}
                  onClick={() => setLength(l.key)}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {formError && <div className="field-error" style={{ marginBottom: 12 }}>{formError}</div>}

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Opening auction…" : "List & Open Auction"}
          </button>
        </div>

        <div className="helper-card">
          <div className="h-label">Estimated Payout at Floor</div>
          <div className="h-row">
            <span className="dim">Sells at rack ($ {rack || 0})</span>
            <span className="num">${payoutAtRack}</span>
          </div>
          <div className="h-row">
            <span className="dim">At +30% premium</span>
            <span className="num gold">${payoutAtPremium}</span>
          </div>
          <div className="h-row">
            <span className="dim">Buyer premium</span>
            <span className="num">14%</span>
          </div>
        </div>
      </form>
      {toastNode}
    </div>
  );
}
