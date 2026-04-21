import { useState, FormEvent } from "react";
import { useCourseAdmin } from "../CourseAdminContext";
import { useAdminToast } from "../useToast";

export default function AdminSettingsPage() {
  const { courseName, slug, courseLocation, rackRateDefault, contactEmail, updateProfile } = useCourseAdmin();
  const { showToast, toastNode } = useAdminToast();

  const [name, setName] = useState(courseName);
  const [s, setS] = useState(slug);
  const [loc, setLoc] = useState(courseLocation);
  const [rack, setRack] = useState(rackRateDefault);
  const [email, setEmail] = useState(contactEmail);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showStripeModal, setShowStripeModal] = useState(false);

  function save(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name) next.name = "Course name is required";
    if (!s) next.slug = "Slug is required";
    if (!email || !email.includes("@")) next.email = "Valid email required";
    if (!rack || rack <= 0) next.rack = "Rack rate must be positive";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    updateProfile({
      courseName: name, slug: s, courseLocation: loc,
      rackRateDefault: rack, contactEmail: email,
    });
    showToast("Course profile saved");
  }

  return (
    <div>
      <h2 className="serif" style={{ marginBottom: 6 }}>Settings</h2>
      <div className="subtitle-mono" style={{ marginTop: 0, marginBottom: 32 }}>
        Course profile and payouts
      </div>

      <div className="settings-section">
        <div className="section-label">Course Profile</div>
        <form className="settings-card" onSubmit={save}>
          <div className="field">
            <label className="field-label">Course Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>
          <div className="field">
            <label className="field-label">Slug / URL</label>
            <input type="text" value={s} onChange={(e) => setS(e.target.value.replace(/\s+/g, "-").toLowerCase())} />
            {errors.slug && <div className="field-error">{errors.slug}</div>}
          </div>
          <div className="field">
            <label className="field-label">Location</label>
            <input type="text" value={loc} onChange={(e) => setLoc(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Default Rack Rate ($)</label>
            <input type="number" value={rack} onChange={(e) => setRack(Number(e.target.value))} />
            {errors.rack && <div className="field-error">{errors.rack}</div>}
          </div>
          <div className="field">
            <label className="field-label">Contact Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {errors.email && <div className="field-error">{errors.email}</div>}
          </div>
          <button type="submit" className="btn-primary">Save Changes</button>
        </form>
      </div>

      <div className="settings-section">
        <div className="section-label">Payouts — Stripe Connect</div>
        <div className="stripe-card">
          <div>
            <div className="stat-label" style={{ marginBottom: 6 }}>Connected Account</div>
            <div className="stripe-status">
              <span className="pill failed"><span className="dot" />Not Connected</span>
            </div>
          </div>
          <button
            className="btn-primary"
            style={{ width: "auto", padding: "12px 22px" }}
            onClick={() => setShowStripeModal(true)}
          >
            Connect Stripe Account
          </button>
        </div>
        <div className="dim" style={{ fontSize: 12, lineHeight: 1.6, marginTop: 4 }}>
          You'll receive 100% of each clearing price. TeeStrike's 14% buyer's premium is charged on top of your
          payout, not deducted from it.
        </div>
      </div>

      {showStripeModal && (
        <div className="modal-backdrop" onClick={() => setShowStripeModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="section-label">Coming Soon</div>
            <h2 className="serif" style={{ fontSize: 26, marginBottom: 14 }}>
              Stripe Connect integration is being finalized.
            </h2>
            <p className="dim" style={{ fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>
              For pilot courses, payouts are handled via wire transfer until this goes live.
              You'll be notified the moment self-serve onboarding is ready.
            </p>
            <button className="btn-secondary" onClick={() => setShowStripeModal(false)}>
              Got it
            </button>
          </div>
        </div>
      )}

      {toastNode}
    </div>
  );
}
