import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const wrap: React.CSSProperties = {
  minHeight: "100vh",
  background: "#06140d",
  color: "#EDE7DA",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  fontFamily: "'DM Sans', system-ui, sans-serif",
};

const card: React.CSSProperties = {
  width: "100%",
  maxWidth: 440,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(201,168,76,0.25)",
  borderRadius: 4,
  padding: 32,
};

const input: React.CSSProperties = {
  width: "100%",
  background: "rgba(0,0,0,0.35)",
  border: "1px solid rgba(255,255,255,0.14)",
  color: "#EDE7DA",
  padding: "10px 12px",
  marginBottom: 12,
  borderRadius: 3,
  fontFamily: "'DM Mono', monospace",
  fontSize: 13,
};

const button = (primary: boolean): React.CSSProperties => ({
  padding: "10px 18px",
  borderRadius: 3,
  cursor: "pointer",
  border: primary ? "1px solid #C9A84C" : "1px solid rgba(255,255,255,0.2)",
  background: primary ? "#C9A84C" : "transparent",
  color: primary ? "#06140d" : "#EDE7DA",
  letterSpacing: "0.08em",
  fontSize: 12,
  textTransform: "uppercase",
});

const title: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 30,
  marginBottom: 8,
};

type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};

const oauth = () => (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // inline sign-in
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id");
        setAuthed(false);
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!active) return;
      if (!sess.session) {
        setAuthed(false);
        return;
      }
      setAuthed(true);
      const { data, error: err } = await oauth().getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (err) return setError(err.message);
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId, authed]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (err) return setError(err.message);
    setAuthed(true);
  }

  async function decide(approve: boolean) {
    setBusy(true);
    const { data, error: err } = approve
      ? await oauth().approveAuthorization(authorizationId)
      : await oauth().denyAuthorization(authorizationId);
    if (err) {
      setBusy(false);
      return setError(err.message);
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      return setError("No redirect returned by the authorization server.");
    }
    window.location.href = target;
  }

  if (authed === false) {
    return (
      <div style={wrap}>
        <form style={card} onSubmit={signIn}>
          <h1 style={title}>Sign in to continue</h1>
          <p style={{ opacity: 0.7, fontSize: 13, marginBottom: 20 }}>
            An app is asking to connect to your TeeStrike account.
          </p>
          <input style={input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input style={input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p style={{ color: "#E4794F", fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button type="submit" disabled={busy} style={button(true)}>
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
          <button
            type="button"
            style={{ ...button(false), marginLeft: 10 }}
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Sign up" : "Have an account"}
          </button>
        </form>
      </div>
    );
  }

  if (error) {
    return (
      <div style={wrap}>
        <div style={card}>
          <h1 style={title}>Authorization failed</h1>
          <p style={{ opacity: 0.75, fontSize: 14 }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div style={wrap}>
        <div style={card}>
          <p style={{ opacity: 0.7 }}>Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <h1 style={title}>Connect {details.client?.name ?? "an app"}</h1>
        <p style={{ opacity: 0.75, fontSize: 14, marginBottom: 24 }}>
          This lets {details.client?.name ?? "the client"} use TeeStrike as you — browsing courses,
          tee time auctions and pricing your bids.
        </p>
        <button disabled={busy} style={button(true)} onClick={() => decide(true)}>
          Approve
        </button>
        <button disabled={busy} style={{ ...button(false), marginLeft: 10 }} onClick={() => decide(false)}>
          Deny
        </button>
      </div>
    </div>
  );
}
