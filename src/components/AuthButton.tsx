"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;

  if (session?.user) {
    return (
      <button
        onClick={() => signOut()}
        className="text-sm text-white/40 hover:text-white transition-colors"
      >
        Sign out
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="text-sm text-white/40 hover:text-white transition-colors"
    >
      Sign in
    </button>
  );
}
