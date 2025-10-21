"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    window.location.replace("/login");
  }, []);
  return (
    <div className="min-h-screen grid place-items-center">Redirecting...</div>
  );
}
