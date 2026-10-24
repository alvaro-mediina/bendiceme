"use client";

import { Home, ShieldCheck } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();

  const isAdmin = pathname.startsWith("/admin");

  return (
    <nav className="mb-8 flex items-center gap-2 rounded-2xl border bg-white p-1.5">
      <button
        type="button"
        onClick={() => {
          sessionStorage.setItem("bendiceme-advisor-active", "true");
          sessionStorage.setItem("bendiceme-advisor-view", "home");

          router.push("/");
        }}
        className="
          flex flex-1 items-center justify-center gap-2
          rounded-xl px-3 py-2.5
          text-sm font-semibold
          text-muted-foreground
          transition-colors
          hover:bg-muted/50
          hover:text-foreground
        "
      >
        <Home className="size-4" />
        Inicio
      </button>

      <button
        type="button"
        onClick={() => router.push("/admin")}
        className={`
          flex flex-1 items-center justify-center gap-2
          rounded-xl px-3 py-2.5
          text-sm font-semibold
          transition-colors
          ${
            isAdmin
              ? "bg-green-600 text-white"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }
        `}
      >
        <ShieldCheck className="size-4" />
        Admin
      </button>
    </nav>
  );
}
