"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

// True when the current visitor is in an anonymous (demo) session. Cosmetic only: it reads the
// local session cookie, so it drives labels and banners, never access control (the server
// checks is_anonymous itself).
export function useIsDemoUser(): boolean {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsDemo(Boolean(session?.user?.is_anonymous));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsDemo(Boolean(session?.user?.is_anonymous));
    });

    return () => subscription.unsubscribe();
  }, []);

  return isDemo;
}
