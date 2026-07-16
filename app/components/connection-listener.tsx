"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

export default function ConnectionListener() {
  const onlineRef = useRef<boolean | null>(null);

  useEffect(() => {
    let interval = setInterval(check, 30000);
    check();
    return () => clearInterval(interval);
  }, []);

  async function check() {
    try {
      const res = await fetch("/api/health");
      if (!res.ok) throw new Error("offline");
      const data = await res.json();
      if (data.ok) {
        if (onlineRef.current === false) {
          toast.success("Connection restored");
        }
        onlineRef.current = true;
      } else {
        if (onlineRef.current !== false) {
          toast.error("Connection to backend failed");
        }
        onlineRef.current = false;
      }
    } catch (err) {
      if (onlineRef.current !== false) {
        toast.error(
          "Connection to backend failed. Check your internet and try again.",
        );
      }
      onlineRef.current = false;
    }
  }

  return null;
}
