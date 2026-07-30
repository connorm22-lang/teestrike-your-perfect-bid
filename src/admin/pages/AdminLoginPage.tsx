import { useState, FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCourseAdmin } from "../CourseAdminContext";
import { AdminStyles } from "../AdminLayout";
import { useAdminToast } from "../useToast";

export default function AdminLoginPage() {
  const { login } = useCourseAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast, toastNode } = useAdminToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setErr("Email and password are required");
      return;
    }
    setErr("");
    setBusy(true);
    const res = await login(email, password);
    setBusy(false);
    if (!res.ok) {
      setErr(res.error || "Those credentials don't match a course account.");
      showToast("Login failed", "error");
      return;
    }
    const from = (location.state as { from?: string } | null)?.from || "/admin";
    navigate(from, { replace: true });
  }

  return (
    <div className="ts-admin">
      <AdminStyles />
      <div className="login-shell">
        <form className="login-card" onSubmit={submit}>
          <div className="login-brand">TeeStrike</div>
          <div className="login-tag">Course Operator Portal</div>

          <div className="field">
            <label className="field-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourcourse.com"
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label className="field-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {err && <div className="field-error" style={{ marginBottom: 16 }}>{err}</div>}

          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? "Signing in…" : "Sign In"}
          </button>
        </form>
        {toastNode}
      </div>
    </div>
  );
}
