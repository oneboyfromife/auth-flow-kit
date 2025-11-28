"use client";
import React, { useEffect } from "react";
import { useAuth } from "./AuthContext";

export default function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login";
    }
  }, [loading, user]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <>{children}</>;
}
