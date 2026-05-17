"use client";

import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: "1rem" }}>
      <h1>Household Dashboard</h1>
      <button
        onClick={() => authClient.signIn.social({ provider: "github", callbackURL: "/dashboard" })}
      >
        Sign in with GitHub
      </button>
      <button
        onClick={async () => {
          const email = prompt("Enter your email");
          if (email) await authClient.signIn.magicLink({ email, callbackURL: "/dashboard" });
        }}
      >
        Sign in with Magic Link
      </button>
    </div>
  );
}