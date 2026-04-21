import { useState, useCallback, useEffect } from "react";

export function useAdminToast() {
  const [toast, setToast] = useState<{ msg: string; kind?: "success" | "error" } | null>(null);

  const show = useCallback((msg: string, kind: "success" | "error" = "success") => {
    setToast({ msg, kind });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const node = toast ? (
    <div className={`toast ${toast.kind === "error" ? "error" : ""}`}>{toast.msg}</div>
  ) : null;

  return { showToast: show, toastNode: node };
}
