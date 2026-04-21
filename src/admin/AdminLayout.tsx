import { ReactNode, useState, useEffect } from "react";
import { NavLink, useNavigate, Navigate, Outlet, useLocation } from "react-router-dom";
import { useCourseAdmin } from "./CourseAdminContext";
import { adminCss } from "./adminTheme";

const NAV = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/slots/new", label: "List a Slot" },
  { to: "/admin/auctions", label: "Active Auctions" },
  { to: "/admin/transactions", label: "Transactions" },
  { to: "/admin/settings", label: "Settings" },
];

export function AdminStyles() {
  return <style>{adminCss}</style>;
}

export function RequireAdminAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useCourseAdmin();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

export function AdminLayout() {
  const { courseName, logout } = useCourseAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="ts-admin">
      <AdminStyles />
      <div className="shell">
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button className="hamburger" onClick={() => setMobileOpen((v) => !v)}>
              {mobileOpen ? "Close" : "Menu"}
            </button>
            <div className="wordmark">TeeStrike</div>
          </div>
          <div className="course-tag">
            {courseName} · Course Dashboard
          </div>
        </header>

        <div className="body">
          <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
            <nav>
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <button
              className="logout"
              onClick={() => {
                logout();
                navigate("/admin/login");
              }}
            >
              Log out
            </button>
          </aside>

          <main className="main">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
