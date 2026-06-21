"use client";

import { useState, useTransition } from "react";
import type { SavingsPot } from "@/app/actions/savings";
import { createSavingsPot, adjustPotBalance, archiveSavingsPot } from "@/app/actions/savings";

// Each colour has a bar/accent, a light bg and a readable text colour.
const COLOR_MAP: Record<SavingsPot["color"], { bar: string; bg: string; text: string }> = {
  green:  { bar: "var(--clr-accent)", bg: "var(--clr-accent-light)", text: "var(--clr-accent-hover)" },
  blue:   { bar: "#378ADD", bg: "#E6F1FB", text: "#0C447C" },
  amber:  { bar: "#EF9F27", bg: "var(--clr-warning-bg)", text: "var(--clr-warning)" },
  coral:  { bar: "#D85A30", bg: "#FAECE7", text: "#4A1B0C" },
  purple: { bar: "#7F77DD", bg: "#EEEDFE", text: "#26215C" },
  teal:   { bar: "#2BB3B1", bg: "#E0F7F7", text: "#006969" },
  pink:   { bar: "#E46AA5", bg: "#F8E6F0", text: "#7B1A65" },
  indigo: { bar: "#4B63D6", bg: "#E8EAF6", text: "#1A237E" },
  lime:   { bar: "#A3C644", bg: "#F1F8E9", text: "#33691E" },
  slate:  { bar: "#64748B", bg: "var(--clr-bg-alt)", text: "var(--clr-ink-2)" },
};

const EMOJI_OPTIONS = ["🏦", "🏖️", "🚨", "🏠", "🎄", "🚗", "💍", "🎓", "✈️", "💻", "🐾", "💷"];
const COLOR_OPTIONS: SavingsPot["color"][] = ["green", "blue", "amber", "coral", "purple", "teal", "pink", "indigo", "lime", "slate"];

const sharedInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--clr-border)",
  borderRadius: "var(--r-sm)",
  fontSize: "14px",
  background: "var(--clr-bg-alt)",
  color: "var(--clr-ink)",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "var(--font-body)",
};

const labelStyle: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 600,
  letterSpacing: "0.8px",
  textTransform: "uppercase",
  color: "var(--clr-ink-3)",
  display: "block",
  marginBottom: "6px",
};

function money(n: number) {
  return `£${n.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;
}

function PotCard({ pot, onAdjust }: { pot: SavingsPot; onAdjust: (pot: SavingsPot) => void }) {
  const [isPending, startTransition] = useTransition();
  const c = COLOR_MAP[pot.color];

  function handleArchive() {
    if (!confirm(`Remove "${pot.name}" from your savings view?`)) return;
    startTransition(() => archiveSavingsPot(pot.id));
  }

  return (
    <div className="card" style={{ display: "flex", alignItems: "center", gap: "14px", opacity: isPending ? 0.6 : 1, transition: "opacity var(--dur) var(--ease)" }}>
      <div style={{ width: "44px", height: "44px", borderRadius: "var(--r-sm)", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
        {pot.emoji}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--clr-ink)" }}>{pot.name}</div>
        <div style={{ fontSize: "20px", fontWeight: 500, color: "var(--clr-ink)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
          {money(pot.currentAmount)}
        </div>
      </div>

      <button
        onClick={() => onAdjust(pot)}
        style={{ padding: "8px 14px", borderRadius: "var(--r-sm)", border: `1px solid ${c.bar}`, background: "transparent", color: c.bar, fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-body)", flexShrink: 0 }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = c.bg)}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
      >
        Adjust
      </button>
      <button
        onClick={handleArchive}
        title="Remove pot"
        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--clr-ink-4)", fontSize: "16px", lineHeight: 1, padding: "2px 4px", flexShrink: 0 }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--clr-ink-2)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--clr-ink-4)")}
      >
        ···
      </button>
    </div>
  );
}

function AdjustModal({ pot, onClose }: { pot: SavingsPot; onClose: () => void }) {
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const quickAmounts = [10, 25, 50, 100, 250];

  function handleSubmit() {
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    setError("");
    const delta = mode === "deposit" ? num : -num;
    startTransition(async () => {
      await adjustPotBalance({ pot_id: pot.id, amount: delta, note: note || undefined });
      onClose();
    });
  }

  const tabBtn = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "9px",
    borderRadius: "var(--r-sm)",
    border: "none",
    background: active ? "var(--clr-surface)" : "transparent",
    color: active ? "var(--clr-ink)" : "var(--clr-ink-3)",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "var(--font-body)",
  });

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(26,25,21,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card" style={{ borderRadius: "var(--r-xl) var(--r-xl) 0 0", padding: "24px 20px 36px", width: "100%", maxWidth: "480px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <div style={{ fontSize: "17px", fontWeight: 500, color: "var(--clr-ink)" }}>{pot.emoji} {pot.name}</div>
            <div style={{ fontSize: "12px", color: "var(--clr-ink-3)", marginTop: "2px" }}>Current: {money(pot.currentAmount)}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: "var(--clr-ink-3)", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: "flex", gap: "4px", padding: "4px", background: "var(--clr-bg-alt)", borderRadius: "var(--r-md)", marginBottom: "16px" }}>
          <button onClick={() => setMode("deposit")} style={tabBtn(mode === "deposit")}>Add</button>
          <button onClick={() => setMode("withdraw")} style={tabBtn(mode === "withdraw")}>Withdraw</button>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
          {quickAmounts.map((q) => (
            <button
              key={q}
              onClick={() => setAmount(String(q))}
              style={{ padding: "6px 14px", borderRadius: "var(--r-full)", border: "1px solid var(--clr-border)", background: amount === String(q) ? "var(--clr-ink)" : "transparent", color: amount === String(q) ? "var(--clr-bg)" : "var(--clr-ink-2)", fontSize: "13px", cursor: "pointer", fontFamily: "var(--font-body)" }}
            >
              £{q}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={labelStyle}>Amount</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "15px", color: "var(--clr-ink-3)" }}>£</span>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" min="0.01" step="0.01" style={{ ...sharedInputStyle, paddingLeft: "30px", fontSize: "16px" }} />
          </div>
          {error && <div style={{ fontSize: "12px", color: "var(--clr-danger)", marginTop: "4px" }}>{error}</div>}
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>Note (optional)</label>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Monthly transfer" style={sharedInputStyle} />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending || !amount}
          style={{ width: "100%", padding: "13px", borderRadius: "var(--r-md)", border: "none", background: isPending || !amount ? "var(--clr-bg-alt)" : "var(--clr-ink)", color: isPending || !amount ? "var(--clr-ink-4)" : "var(--clr-bg)", fontSize: "14px", fontWeight: 500, cursor: isPending || !amount ? "not-allowed" : "pointer", fontFamily: "var(--font-body)" }}
        >
          {isPending ? "Saving…" : mode === "deposit" ? "Add to pot" : "Withdraw"}
        </button>
      </div>
    </div>
  );
}

function CreatePotModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🏦");
  const [starting, setStarting] = useState("");
  const [color, setColor] = useState<SavingsPot["color"]>("green");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!name.trim()) {
      setError("Please enter a name");
      return;
    }
    setError("");
    const start = parseFloat(starting);
    startTransition(async () => {
      await createSavingsPot({
        name: name.trim(),
        emoji,
        starting_amount: isNaN(start) || start < 0 ? 0 : start,
        color,
      });
      onClose();
    });
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(26,25,21,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="card" style={{ borderRadius: "var(--r-xl) var(--r-xl) 0 0", padding: "24px 20px 36px", width: "100%", maxWidth: "480px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "17px", fontWeight: 500, color: "var(--clr-ink)" }}>New savings pot</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: "var(--clr-ink-3)", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Icon</label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                style={{ width: "40px", height: "40px", borderRadius: "var(--r-sm)", border: emoji === e ? "2px solid var(--clr-ink)" : "1px solid var(--clr-border)", background: emoji === e ? "var(--clr-bg-alt)" : "transparent", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={labelStyle}>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Trading212 ISA" style={sharedInputStyle} />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Current balance (optional)</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "15px", color: "var(--clr-ink-3)" }}>£</span>
            <input type="number" value={starting} onChange={(e) => setStarting(e.target.value)} placeholder="0.00" min="0" step="0.01" style={{ ...sharedInputStyle, paddingLeft: "30px", fontSize: "16px" }} />
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>Colour</label>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {COLOR_OPTIONS.map((cc) => (
              <button
                key={cc}
                onClick={() => setColor(cc)}
                style={{ width: "28px", height: "28px", borderRadius: "50%", background: COLOR_MAP[cc].bar, border: color === cc ? "3px solid var(--clr-ink)" : "3px solid transparent", cursor: "pointer", boxSizing: "border-box", outline: color === cc ? `2px solid ${COLOR_MAP[cc].bar}` : "none", outlineOffset: "2px" }}
              />
            ))}
          </div>
        </div>

        {error && <div style={{ fontSize: "12px", color: "var(--clr-danger)", marginBottom: "12px" }}>{error}</div>}

        <button
          onClick={handleSubmit}
          disabled={isPending}
          style={{ width: "100%", padding: "13px", borderRadius: "var(--r-md)", border: "none", background: isPending ? "var(--clr-bg-alt)" : "var(--clr-ink)", color: isPending ? "var(--clr-ink-4)" : "var(--clr-bg)", fontSize: "14px", fontWeight: 500, cursor: isPending ? "not-allowed" : "pointer", fontFamily: "var(--font-body)" }}
        >
          {isPending ? "Creating…" : "Create pot"}
        </button>
      </div>
    </div>
  );
}

export default function SavingsPots({ initialPots }: { initialPots: SavingsPot[] }) {
  const [pots] = useState(initialPots);
  const [adjusting, setAdjusting] = useState<SavingsPot | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const totalSaved = pots.reduce((sum, p) => sum + p.currentAmount, 0);

  return (
    <div style={{ fontFamily: "var(--font-body)" }}>
      {/* Live total */}
      {pots.length > 0 && (
        <div className="card" style={{ marginBottom: "12px" }}>
          <div className="widget-label" style={{ marginBottom: "4px" }}>Total in savings</div>
          <div style={{ fontSize: "32px", fontWeight: 500, color: "var(--clr-ink)", fontFamily: "var(--font-mono)" }}>
            {money(totalSaved)}
          </div>
          <div style={{ fontSize: "12px", color: "var(--clr-ink-3)", marginTop: "2px" }}>
            across {pots.length} pot{pots.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {pots.map((pot) => (
          <PotCard key={pot.id} pot={pot} onAdjust={setAdjusting} />
        ))}
      </div>

      {pots.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--clr-ink-3)" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏦</div>
          <div style={{ fontSize: "16px", fontWeight: 500, color: "var(--clr-ink)", marginBottom: "6px" }}>No savings pots yet</div>
          <div style={{ fontSize: "13px", lineHeight: 1.5 }}>
            Add a pot for each place you keep savings<br />to see your live total in one view.
          </div>
        </div>
      )}

      <button
        onClick={() => setShowCreate(true)}
        style={{ width: "100%", marginTop: "12px", padding: "12px", borderRadius: "var(--r-lg)", border: "1px dashed var(--clr-border)", background: "var(--clr-surface)", color: "var(--clr-ink-3)", fontSize: "14px", fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: "var(--font-body)" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--clr-accent)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--clr-accent)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--clr-border)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--clr-ink-3)"; }}
      >
        + New savings pot
      </button>

      {adjusting && <AdjustModal pot={adjusting} onClose={() => setAdjusting(null)} />}
      {showCreate && <CreatePotModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
