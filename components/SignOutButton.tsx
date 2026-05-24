"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export function SignOutButton({ email }: { email: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onClick() {
    setLoading(true);
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden md:inline text-xs text-ink-500 truncate max-w-[200px]">
        {email}
      </span>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="text-xs font-medium text-ink-600 hover:text-ink-900 px-3 py-1.5 rounded-full hover:bg-sand-100 disabled:opacity-50"
      >
        {loading ? "Signing out…" : "Sign out"}
      </button>
    </div>
  );
}
