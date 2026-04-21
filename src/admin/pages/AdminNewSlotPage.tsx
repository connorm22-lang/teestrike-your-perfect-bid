import { useState, FormEvent, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCourseAdmin } from "../CourseAdminContext";
import { useAdminToast } from "../useToast";

function pad(n: number) { return String(n).padStart(2, "0"); }

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function localDateTime(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultAuctionEnd(teeDate: string) {
  // 6 PM the night before tee time
  if (!teeDate) return "";
  const [y, m, d] = teeDate.split("-").map(Number);
  const dt = new Date(y, m - 1, d - 1, 18, 0);
  return localDateTime(dt);
}

export default function AdminNewSlotPage() {
  const navigate = useNavigate();
  const { rackRateDefault } = useCourseAdmin();
  const { showToast, toastNode } = useAdminToast();

  const [date, setDate] = useState(tomorrowISO());
  const [teeTime, setTeeTime] = useState("08:00");
  const [players, setPlayers] = useState(4);
  const [rack, setRack] = useState(rackRateDefault);
  const [increment, setIncrement] = useState(5);
  const [opensAt, setOpensAt] = useState(localDateTime(new Date()));
  const [endsAt, setEndsAt] = useState(defaultAuctionEnd(tomorrowISO()));
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Re-default ends-at when tee date changes (only if user hasn't customized recently)
  function onDateChange(v: string) {
    setDate(v);
    setEndsAt(defaultAuctionEnd(v));
  }

  const payoutAtRack = rack;
  const payoutAtPremium = useMemo(() => Math.round(rack * 1.3), [rack]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!date) next.date = "Date is required";
    if (!teeTime) next.teeTime = "Tee time is required";
    if (!rack || rack <= 0) next.rack = "Rack rate must be positive";
    if (!opensAt) next.opensAt = "Opening time is required";
    if (!endsAt) next.endsAt = "Closing time is required";
    if (opensAt && endsAt && new Date(opensAt) >= new Date(endsAt)) {
      next.endsAt = "Closing must be after opening";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      showToast("Fix the errors below", "error");
      return;
    }

    const opensReadable = new Date(opensAt).toLocaleString("en-US", {
      hour: "numeric", minute: "2-digit", weekday: "short",
    });
    showToast(`Tee time listed. Auction opens at ${opensReadable}`);
    setTimeout(() => navigate("/admin/auctions"), 800);
  }

  return (
    <div>
      <h2 className="serif" style={{ marginBottom: 6 }}>List a Tee Time</h2>
      <div className="subtitle-mono" style={{ marginTop: 0, marginBottom: 28 }}>
        This will open an auction
      </div>

      <form className="form" onSubmit={submit}>
        <div className="form-card">
          <div className="field">
            <label className="field-label">Date</label>
            <input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} />
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
            <label className="field-label">Rack Rate ($)</label>
            <input type="number" value={rack} min={1}
              onChange={(e) => setRack(Number(e.target.value))} />
            {errors.rack && <div className="field-error">{errors.rack}</div>}
          </div>

          <div className="field">
            <label className="field-label">Bid Increment ($) · optional</label>
            <input type="number" value={increment} min={1}
              onChange={(e) => setIncrement(Number(e.target.value))} />
          </div>

          <div className="field">
            <label className="field-label">Auction Opens At</label>
            <input type="datetime-local" value={opensAt}
              onChange={(e) => setOpensAt(e.target.value)} />
            {errors.opensAt && <div className="field-error">{errors.opensAt}</div>}
          </div>

          <div className="field">
            <label className="field-label">Auction Ends At</label>
            <input type="datetime-local" value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)} />
            {errors.endsAt && <div className="field-error">{errors.endsAt}</div>}
          </div>

          <div className="field">
            <label className="field-label">Notes · optional</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Cart included, range balls, etc."
            />
          </div>

          <button type="submit" className="btn-primary">List & Open Auction</button>
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
        </div>
      </form>
      {toastNode}
    </div>
  );
}
