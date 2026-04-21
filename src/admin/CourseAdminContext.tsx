import { createContext, useContext, useState, ReactNode, useCallback } from "react";

type AdminState = {
  isAuthenticated: boolean;
  courseName: string;
  courseLocation: string;
  rackRateDefault: number;
  contactEmail: string;
  slug: string;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (patch: Partial<Omit<AdminState, "login" | "logout" | "updateProfile" | "isAuthenticated">>) => void;
};

const CourseAdminContext = createContext<AdminState | null>(null);

export function CourseAdminProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setAuth] = useState(false);
  const [courseName, setCourseName] = useState("Waterchase Golf Club");
  const [courseLocation, setCourseLocation] = useState("Fort Worth, TX");
  const [rackRateDefault, setRackRate] = useState(79);
  const [contactEmail, setContactEmail] = useState("admin@waterchase.com");
  const [slug, setSlug] = useState("waterchase");

  const login = useCallback((email: string, password: string) => {
    // Mock auth — accepts the demo credentials, but we keep it permissive
    // so the demo flow always works.
    if (email && password) {
      setAuth(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => setAuth(false), []);

  const updateProfile: AdminState["updateProfile"] = useCallback((patch) => {
    if (patch.courseName !== undefined) setCourseName(patch.courseName);
    if (patch.courseLocation !== undefined) setCourseLocation(patch.courseLocation);
    if (patch.rackRateDefault !== undefined) setRackRate(patch.rackRateDefault);
    if (patch.contactEmail !== undefined) setContactEmail(patch.contactEmail);
    if (patch.slug !== undefined) setSlug(patch.slug);
  }, []);

  return (
    <CourseAdminContext.Provider
      value={{
        isAuthenticated,
        courseName,
        courseLocation,
        rackRateDefault,
        contactEmail,
        slug,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </CourseAdminContext.Provider>
  );
}

export function useCourseAdmin() {
  const ctx = useContext(CourseAdminContext);
  if (!ctx) throw new Error("useCourseAdmin must be used within CourseAdminProvider");
  return ctx;
}
