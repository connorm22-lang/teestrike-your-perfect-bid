import { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type CourseRow = {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  rack_rate_default: number | null;
  contact_email: string | null;
};

const STORAGE_KEY = "teestrike.admin.selectedCourseId";

type AdminState = {
  loading: boolean;
  session: Session | null;
  isAuthenticated: boolean;
  courses: CourseRow[];
  selectedCourseId: string | null;
  setSelectedCourse: (id: string) => void;
  courseId: string | null;
  courseName: string;
  courseLocation: string;
  rackRateDefault: number;
  contactEmail: string;
  slug: string;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (patch: {
    courseName?: string;
    courseLocation?: string;
    rackRateDefault?: number;
    contactEmail?: string;
    slug?: string;
  }) => Promise<{ ok: boolean; error?: string }>;
};

const CourseAdminContext = createContext<AdminState | null>(null);

const NOT_AUTHORIZED = "Those credentials don't match a course account.";

export function CourseAdminProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const loadCourses = useCallback(async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", userId)
      .maybeSingle();

    if (!profile || profile.role !== "course_admin") {
      setCourses([]);
      setSelectedId(null);
      return [];
    }

    const { data } = await (supabase as any).rpc("get_my_courses");

    const rows = (data as CourseRow[] | null) ?? [];
    setCourses(rows);

    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      stored = null;
    }
    const next = rows.find((c) => c.id === stored)?.id ?? rows[0]?.id ?? null;
    setSelectedId(next);
    return rows;
  }, []);

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!active) return;
      setSession(s);
      if (!s) {
        setCourses([]);
        setSelectedId(null);
        setLoading(false);
      } else {
        setTimeout(() => {
          loadCourses(s.user.id).finally(() => active && setLoading(false));
        }, 0);
      }
    });

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session) await loadCourses(data.session.user.id);
      if (active) setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadCourses]);

  const setSelectedCourse = useCallback((id: string) => {
    setSelectedId(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const course = useMemo(
    () => courses.find((c) => c.id === selectedId) ?? courses[0] ?? null,
    [courses, selectedId]
  );

  const login = useCallback<AdminState["login"]>(
    async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) return { ok: false, error: NOT_AUTHORIZED };
      const rows = await loadCourses(data.user.id);
      if (rows.length === 0) {
        await supabase.auth.signOut();
        return { ok: false, error: NOT_AUTHORIZED };
      }
      return { ok: true };
    },
    [loadCourses]
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setCourses([]);
    setSelectedId(null);
  }, []);

  const updateProfile = useCallback<AdminState["updateProfile"]>(
    async (patch) => {
      if (!course) return { ok: false, error: "No course loaded" };
      const payload: {
        name?: string;
        location?: string;
        rack_rate_default?: number;
        contact_email?: string;
        slug?: string;
      } = {};
      if (patch.courseName !== undefined) payload.name = patch.courseName;
      if (patch.courseLocation !== undefined) payload.location = patch.courseLocation;
      if (patch.rackRateDefault !== undefined) payload.rack_rate_default = patch.rackRateDefault;
      if (patch.contactEmail !== undefined) payload.contact_email = patch.contactEmail;
      if (patch.slug !== undefined) payload.slug = patch.slug;

      const { error } = await supabase
        .from("courses")
        .update(payload)
        .eq("id", course.id);

      if (error) return { ok: false, error: error.message };

      const { data } = await (supabase as any).rpc("get_my_courses");
      if (data) setCourses(data as CourseRow[]);
      return { ok: true };
    },
    [course]
  );

  return (
    <CourseAdminContext.Provider
      value={{
        loading,
        session,
        isAuthenticated: Boolean(session && course),
        courses,
        selectedCourseId: course?.id ?? null,
        setSelectedCourse,
        courseId: course?.id ?? null,
        courseName: course?.name ?? "",
        courseLocation: course?.location ?? "",
        rackRateDefault: Number(course?.rack_rate_default ?? 0),
        contactEmail: course?.contact_email ?? "",
        slug: course?.slug ?? "",
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
