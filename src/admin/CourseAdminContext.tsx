import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type CourseRow = {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  rack_rate_default: number | null;
  contact_email: string | null;
};

type AdminState = {
  loading: boolean;
  session: Session | null;
  isAuthenticated: boolean;
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
  const [course, setCourse] = useState<CourseRow | null>(null);

  const loadCourse = useCallback(async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", userId)
      .maybeSingle();

    if (!profile || profile.role !== "course_admin") {
      setCourse(null);
      return null;
    }

    const { data: courses } = await supabase
      .from("courses")
      .select("id, name, slug, location, rack_rate_default, contact_email")
      .eq("admin_id", userId)
      .order("name")
      .limit(1);

    const row = (courses?.[0] as CourseRow | undefined) ?? null;
    setCourse(row);
    return row;
  }, []);

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!active) return;
      setSession(s);
      if (!s) {
        setCourse(null);
        setLoading(false);
      } else {
        // defer supabase calls out of the auth callback
        setTimeout(() => {
          loadCourse(s.user.id).finally(() => active && setLoading(false));
        }, 0);
      }
    });

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session) await loadCourse(data.session.user.id);
      if (active) setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadCourse]);

  const login = useCallback<AdminState["login"]>(
    async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.user) return { ok: false, error: NOT_AUTHORIZED };
      const row = await loadCourse(data.user.id);
      if (!row) {
        await supabase.auth.signOut();
        return { ok: false, error: NOT_AUTHORIZED };
      }
      return { ok: true };
    },
    [loadCourse]
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setCourse(null);
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

      const { data, error } = await supabase
        .from("courses")
        .update(payload)
        .eq("id", course.id)
        .select("id, name, slug, location, rack_rate_default, contact_email")
        .maybeSingle();

      if (error) return { ok: false, error: error.message };
      if (data) setCourse(data as CourseRow);
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
