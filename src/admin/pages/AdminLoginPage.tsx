import { useState, FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCourseAdmin } from "../CourseAdminContext";
import { AdminStyles } from "../AdminLayout";
import { useAdminToast } from "../useToast";

const DEMO_EMAIL = "admin@waterchase.com";
const DEMO_PASSWORD = "password123";

export default function AdminLoginPage() {
  const { login } = useCourseAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast, toastNode } = useAdminToast();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [err, setErr] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setErr("Email and password are required");
      return;
    }
    const ok = login(email, password);
    if (!ok) {
      setErr("Invalid credentials");
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

          <button type="submit" className="btn-primary">Sign In</button>

          <button
            type="button"
            className="login-fill"
            onClick={() => {
              setEmail(DEMO_EMAIL);
              setPassword(DEMO_PASSWORD);
              setErr("");
            }}
          >
            [ Fill demo credentials ]
          </button>
        </form>
        {toastNode}
      </div>
    </div>
  );
}
