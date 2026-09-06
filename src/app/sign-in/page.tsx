"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { GithubIcon, MailIcon, LeafIcon } from "@/components/Icons";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/dashboard",
    });
    if (error) setError(error.message ?? "Something went wrong");
  };

  return (
    <div className="signin-page">
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
        <LeafIcon size={28} strokeWidth={1.5} />
        <h1 className="signin-logo">Hoose</h1>
      </div>
      <p className="signin-subtitle">Your household, organised.</p>

      <div className="signin-card">
        <form onSubmit={handlePasswordSignIn} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p style={{ color: "red", fontSize: "0.85em" }}>{error}</p>}
          <button className="btn btn--primary" type="submit">
            Sign in
          </button>
        </form>

        <div className="signin-divider">or</div>

        <button
          className="btn btn--outline"
          onClick={() =>
            authClient.signIn.social({ provider: "github", callbackURL: "/dashboard" })
          }
        >
          <GithubIcon size={18} strokeWidth={1.75} />
          Continue with GitHub
        </button>

        <button
          className="btn btn--outline"
          onClick={async () => {
            const email = prompt("Enter your email");
            if (email)
              await authClient.signIn.magicLink({ email, callbackURL: "/dashboard" });
          }}
        >
          <MailIcon size={18} strokeWidth={1.75} />
          Sign in with Magic Link
        </button>
      </div>
    </div>
  );
}