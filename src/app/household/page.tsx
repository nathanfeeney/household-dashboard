"use client";

import { useState } from "react";
import { createHousehold, joinHousehold } from "@/app/actions/household";

export default function HouseholdPage() {
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [mode, setMode] = useState<"create" | "join">("create");

  const inputStyle: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: "var(--r-sm)",
    border: "1px solid var(--clr-border)",
    fontSize: "15px",
    background: "var(--clr-bg-alt)",
    color: "var(--clr-ink)",
    fontFamily: "var(--font-body)",
    outline: "none",
    width: "100%",
  };

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 400, color: "var(--clr-ink)", marginBottom: "0.5rem" }}>
        Welcome
      </h1>
      <p style={{ color: "var(--clr-ink-3)", marginBottom: "2rem", fontSize: "14px" }}>
        Set up your household to get started
      </p>

      <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem" }}>
        <button
          onClick={() => setMode("create")}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "var(--r-sm)",
            border: "1px solid var(--clr-border)",
            background: mode === "create" ? "var(--clr-ink)" : "var(--clr-surface)",
            color: mode === "create" ? "var(--clr-bg)" : "var(--clr-ink-2)",
            cursor: "pointer",
            fontWeight: 500,
            fontSize: "14px",
            fontFamily: "var(--font-body)",
            transition: "all var(--dur) var(--ease)",
          }}
        >
          Create household
        </button>
        <button
          onClick={() => setMode("join")}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "var(--r-sm)",
            border: "1px solid var(--clr-border)",
            background: mode === "join" ? "var(--clr-ink)" : "var(--clr-surface)",
            color: mode === "join" ? "var(--clr-bg)" : "var(--clr-ink-2)",
            cursor: "pointer",
            fontWeight: 500,
            fontSize: "14px",
            fontFamily: "var(--font-body)",
            transition: "all var(--dur) var(--ease)",
          }}
        >
          Join household
        </button>
      </div>

      {mode === "create" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Household name e.g. The Smiths"
            style={inputStyle}
          />
          <button
            onClick={() => createHousehold(name)}
            className="btn btn--primary"
          >
            Create
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <input
            value={inviteCode}
            onChange={e => setInviteCode(e.target.value)}
            placeholder="Enter invite code"
            style={inputStyle}
          />
          <button
            onClick={() => joinHousehold(inviteCode)}
            className="btn btn--primary"
          >
            Join
          </button>
        </div>
      )}
    </div>
  );
}
