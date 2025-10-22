"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export function AdminHeader({ title, onMenuClick }) {
  const { data } = useSession();
  const user = data?.user;
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (open && menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleKey(e) {
      if (open && e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <header className="h-16 flex items-center justify-between border-b border-border px-4 bg-background/60 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            type="button"
            className="md:hidden p-2 rounded hover:bg-muted"
            onClick={() => onMenuClick()}
            aria-label="Open Menu"
          >
            <Menu size={20} />
          </button>
        )}
        <h1 className="text-2xl font-semibold">{title}</h1>
      </div>
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          className="px-3 py-2 rounded-md border text-sm hover:bg-secondary"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {user?.name ?? "operator@realpowertech.com"}
        </button>
        {open && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-48 bg-popover text-popover-foreground border rounded-md shadow-md"
          >
            <button
              type="button"
              className={cn(
                "w-full text-left px-3 py-2 text-sm hover:bg-secondary rounded-t-md"
              )}
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              Profile
            </button>
            <button
              type="button"
              className={cn(
                "w-full text-left px-3 py-2 text-sm hover:bg-secondary text-red-600 rounded-b-md"
              )}
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: "/login" });
              }}
              role="menuitem"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
