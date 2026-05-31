"use client";

import { authClient } from "@/lib/auth-client";
import { GithubIcon, MailIcon, LeafIcon } from "@/components/Icons";

export default function SignInPage() {
  return (
    <div className="signin-page">
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
        <LeafIcon size={28} strokeWidth={1.5}  />
        <h1 className="signin-logo">Hoose</h1>
      </div>
      <p className="signin-subtitle">Your household, organised.</p>

      <div className="signin-card">
        <button
          className="btn btn--primary"
          onClick={() =>
            authClient.signIn.social({ provider: "github", callbackURL: "/dashboard" })
          }
        >
          <GithubIcon size={18} strokeWidth={1.75} />
          Continue with GitHub
        </button>

        <div className="signin-divider">or</div>

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
