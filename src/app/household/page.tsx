"use client";

import { useState } from "react";
import { createHousehold, joinHousehold } from "@/app/actions/household";

export default function HouseholdPage() {
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [mode, setMode] = useState<"create" | "join">("create");

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "0.5rem" }}>Welcome</h1>
      <p style={{ color: "#6b7280", marginBottom: "2rem" }}>Set up your household to get started</p>

      <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem" }}>
        <button
          onClick={() => setMode("create")}
          style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb", background: mode === "create" ? "#1D9E75" : "#fff", color: mode === "create" ? "#fff" : "#374151", cursor: "pointer", fontWeight: 500 }}
        >
          Create household
        </button>
        <button
          onClick={() => setMode("join")}
          style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb", background: mode === "join" ? "#1D9E75" : "#fff", color: mode === "join" ? "#fff" : "#374151", cursor: "pointer", fontWeight: 500 }}
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
            style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "15px" }}
          />
          <button
            onClick={() => createHousehold(name)}
            style={{ padding: "10px", borderRadius: "8px", background: "#1D9E75", color: "#fff", border: "none", fontSize: "15px", cursor: "pointer", fontWeight: 500 }}
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
            style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "15px" }}
          />
          <button
            onClick={() => joinHousehold(inviteCode)}
            style={{ padding: "10px", borderRadius: "8px", background: "#1D9E75", color: "#fff", border: "none", fontSize: "15px", cursor: "pointer", fontWeight: 500 }}
          >
            Join
          </button>
        </div>
      )}
    </div>
  );
}