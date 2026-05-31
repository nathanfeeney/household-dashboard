"use client";

import { useState, useTransition } from "react";
import type { SavingsPot } from "@/app/actions/savings";
import {
  createSavingsPot,
  addContribution,
  archiveSavingsPot,
  updateSavingsPot,
} from "@/app/actions/savings";

const COLOR_MAP: Record<
  SavingsPot["color"],
  { bar: string; bg: string; text: string; badge: string }
> = {
  green:  { bar: "#1D9E75", bg: "#E1F5EE", text: "#085041", badge: "#9FE1CB" },
  blue:   { bar: "#378ADD", bg: "#E6F1FB", text: "#0C447C", badge: "#B5D4F4" },
  amber:  { bar: "#EF9F27", bg: "#FAEEDA", text: "#633806", badge: "#FAC775" },
  coral:  { bar: "#D85A30", bg: "#FAECE7", text: "#4A1B0C", badge: "#F5C4B3" },
  purple: { bar: "#7F77DD", bg: "#EEEDFE", text: "#26215C", badge: "#CECBF6" },
  teal:   { bar: "#2BB3B1", bg: "#E0F7F7", text: "#006969", badge: "#80CBC4" },
  pink:   { bar: "#E46AA5", bg: "#F8E6F0", text: "#7B1FA2", badge: "#F48FB1" },
  indigo: { bar: "#4B63D6", bg: "#E8EAF6", text: "#1A237E", badge: "#9575CD" },
  lime:   { bar: "#A3C644", bg: "#F1F8E9", text: "#33691E", badge: "#C5E1A5" },
  slate:  { bar: "#64748B", bg: "#E2E8F0", text: "#2D3748", badge: "#A0AEC0" },
};

const EMOJI_OPTIONS = ["🏖️", "🚨", "🏠", "🎄", "🚗", "💍", "🎓", "✈️", "💻", "🐾"];
const COLOR_OPTIONS: SavingsPot["color"][] = ["green", "blue", "amber", "coral", "purple", "teal", "pink", "indigo", "lime", "slate"];

function ProgressBar({ current, target, color }: { current: number; target: number; color: SavingsPot["color"] }) {
  const pct = Math.min((current / target) * 100, 100);
  const c = COLOR_MAP[color];
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          height: "6px",
          background: "#E5E5E5",
          borderRadius: "99px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: c.bar,
            borderRadius: "99px",
            transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
      </div>
    </div>
  );
}

function PotCard({
  pot,
  onContribute,
}: {
  pot: SavingsPot;
  onContribute: (pot: SavingsPot) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const c = COLOR_MAP[pot.color];
  const pct = Math.min(Math.round((pot.currentAmount / pot.targetAmount) * 100), 100);
  const remaining = Math.max(pot.targetAmount - pot.currentAmount, 0);
  const isComplete = pot.currentAmount >= pot.targetAmount;

  function handleArchive() {
    if (!confirm(`Archive "${pot.name}"? It will be hidden from your dashboard.`)) return;
    startTransition(() => archiveSavingsPot(pot.id));
  }

  return (
    <div
      style={{
        border: "0.5px solid #E5E5E5",
        borderRadius: "16px",
        padding: "18px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        opacity: isPending ? 0.6 : 1,
        transition: "opacity 0.2s",
      }}
      className="card"
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            {pot.emoji}
          </div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 500, color: "#e6e6e6" }}>{pot.name}</div>
            <div style={{ fontSize: "12px", color: "#888", marginTop: "1px" }}>
              {isComplete ? "🎉 Goal reached!" : `£${remaining.toLocaleString("en-GB", { minimumFractionDigits: 2 })} to go`}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 500,
              padding: "3px 9px",
              borderRadius: "99px",
              background: c.bg,
              color: c.text,
            }}
          >
            {pct}%
          </span>
          <button
            onClick={handleArchive}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#bbb",
              fontSize: "16px",
              lineHeight: 1,
              padding: "2px 4px",
            }}
            title="Archive pot"
          >
            ···
          </button>
        </div>
      </div>

      {/* Progress */}
      <ProgressBar current={pot.currentAmount} target={pot.targetAmount} color={pot.color} />

      {/* Amounts */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: "20px", fontWeight: 500, color: "#e6e6e6" }}>
          £{pot.currentAmount.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
        </span>
        <span style={{ fontSize: "13px", color: "#888" }}>
          of £{pot.targetAmount.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Add funds button */}
      {!isComplete && (
        <button
          onClick={() => onContribute(pot)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "10px",
            border: `0.5px solid ${c.bar}`,
            background: "transparent",
            color: c.bar,
            fontSize: "13px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.background = c.bg)}
          onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.background = "transparent")}
        >
          + Add funds
        </button>
      )}
    </div>
  );
}

function ContributeModal({
  pot,
  onClose,
}: {
  pot: SavingsPot;
  onClose: () => void;
}) {
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
    startTransition(async () => {
      await addContribution({ pot_id: pot.id, amount: num, note: note || undefined });
      onClose();
    });
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 50,
        padding: "0 0 0 0",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          borderRadius: "20px 20px 0 0",
          padding: "24px 20px 36px",
          width: "100%",
          maxWidth: "480px",
        }}
        className="card"  
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <div style={{ fontSize: "17px", fontWeight: 500 }}>Add to {pot.emoji} {pot.name}</div>
            <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
              Current: £{pot.currentAmount.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: "#888" }}>×</button>
        </div>

        {/* Quick amounts */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
          {quickAmounts.map((q) => (
            <button
              key={q}
              onClick={() => setAmount(String(q))}
              style={{
                padding: "6px 14px",
                borderRadius: "99px",
                border: "0.5px solid #E5E5E5",
                background: amount === String(q) ? "#1a1a1a" : "transparent",
                color: amount === String(q) ? "#fff" : "#555",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              £{q}
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <div style={{ marginBottom: "12px" }}>
          <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>Amount</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "15px", color: "#555" }}>£</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
              style={{
                width: "100%",
                padding: "12px 14px 12px 30px",
                border: "0.5px solid #E5E5E5",
                borderRadius: "10px",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          {error && <div style={{ fontSize: "12px", color: "#E24B4A", marginTop: "4px" }}>{error}</div>}
        </div>

        {/* Note */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Weekly transfer"
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "0.5px solid #E5E5E5",
              borderRadius: "10px",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending || !amount}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            border: "none",
            background: isPending || !amount ? "#E5E5E5" : "#1a1a1a",
            color: isPending || !amount ? "#999" : "#fff",
            fontSize: "15px",
            fontWeight: 500,
            cursor: isPending || !amount ? "not-allowed" : "pointer",
            transition: "all 0.15s",
          }}
        >
          {isPending ? "Saving…" : "Add funds"}
        </button>
      </div>
    </div>
  );
}

function CreatePotModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🏖️");
  const [target, setTarget] = useState("");
  const [color, setColor] = useState<SavingsPot["color"]>("green");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!name.trim()) { setError("Please enter a name"); return; }
    const num = parseFloat(target);
    if (!num || num <= 0) { setError("Please enter a valid target amount"); return; }
    setError("");
    startTransition(async () => {
      await createSavingsPot({ name: name.trim(), emoji, target_amount: num, color });
      onClose();
    });
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          borderRadius: "20px 20px 0 0",
          padding: "24px 20px 36px",
          width: "100%",
          maxWidth: "480px",
        }}
        className="card"
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "17px", fontWeight: 500 }}>New savings pot</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: "#888" }}>×</button>
        </div>

        {/* Emoji picker */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "8px" }}>Icon</label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  border: emoji === e ? "2px solid #1a1a1a" : "0.5px solid #E5E5E5",
                  background: emoji === e ? "#F5F5F5" : "transparent",
                  fontSize: "20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div style={{ marginBottom: "12px" }}>
          <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Trading212 ISA"
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "0.5px solid #E5E5E5",
              borderRadius: "10px",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Target */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "6px" }}>Target amount</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "15px", color: "#555" }}>£</span>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="0.00"
              min="1"
              step="1"
              style={{
                width: "100%",
                padding: "12px 14px 12px 30px",
                border: "0.5px solid #E5E5E5",
                borderRadius: "10px",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Color */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "12px", color: "#888", display: "block", marginBottom: "8px" }}>Colour</label>
          <div style={{ display: "flex", gap: "10px" }}>
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: COLOR_MAP[c].bar,
                  border: color === c ? "3px solid #1a1a1a" : "3px solid transparent",
                  cursor: "pointer",
                  boxSizing: "border-box",
                  outline: color === c ? `2px solid ${COLOR_MAP[c].bar}` : "none",
                  outlineOffset: "2px",
                }}
              />
            ))}
          </div>
        </div>

        {error && <div style={{ fontSize: "12px", color: "#E24B4A", marginBottom: "12px" }}>{error}</div>}

        <button
          onClick={handleSubmit}
          disabled={isPending}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            border: "none",
            background: isPending ? "#E5E5E5" : "#1a1a1a",
            color: isPending ? "#999" : "#fff",
            fontSize: "15px",
            fontWeight: 500,
            cursor: isPending ? "not-allowed" : "pointer",
            transition: "all 0.15s",
          }}
        >
          {isPending ? "Creating…" : "Create pot"}
        </button>
      </div>
    </div>
  );
}

export default function SavingsPots({ initialPots }: { initialPots: SavingsPot[] }) {
  const [pots, _setPots] = useState(initialPots);
  const [contributingTo, setContributingTo] = useState<SavingsPot | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const totalSaved = pots.reduce((sum, p) => sum + p.currentAmount, 0);
  const totalTarget = pots.reduce((sum, p) => sum + p.targetAmount, 0);

  return (
    <div style={{ fontFamily: "inherit" }}>
      {/* Summary header */}
      {pots.length > 0 && (
        <div
          style={{
            border: "0.5px solid #E5E5E5",
            borderRadius: "16px",
            padding: "18px",
            marginBottom: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          className="card"
        >
          <div>
            <div style={{ fontSize: "12px", color: "#e6e6e6", marginBottom: "4px" }}>Total saved</div>
            <div style={{ fontSize: "26px", fontWeight: 500, color: "#e6e6e6" }}>
              £{totalSaved.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: "12px", color: "#e6e6e6", marginTop: "2px" }}>
              of £{totalTarget.toLocaleString("en-GB", { minimumFractionDigits: 2 })} across {pots.length} pot{pots.length !== 1 ? "s" : ""}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "28px", fontWeight: 500, color: "#1D9E75" }}>
              {totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0}%
            </div>
            <div style={{ fontSize: "12px", color: "#888" }}>overall</div>
          </div>
        </div>
      )}

      {/* Pot cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {pots.map((pot) => (
          <PotCard key={pot.id} pot={pot} onContribute={setContributingTo} />
        ))}
      </div>

      {/* Empty state */}
      {pots.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            color: "#888",
          }}
        >
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏦</div>
          <div style={{ fontSize: "16px", fontWeight: 500, color: "#e6e6e6", marginBottom: "6px" }}>
            No savings pots yet
          </div>
          <div style={{ fontSize: "13px", lineHeight: 1.5 }}>
            Create your first pot to start saving<br />towards something you care about.
          </div>
        </div>
      )}

      {/* Add new pot button */}
      <button
        onClick={() => setShowCreate(true)}
        style={{
          width: "100%",
          marginTop: "12px",
          padding: "14px",
          borderRadius: "12px",
          border: "0.5px dashed #CCC",
          background: "transparent",
          color: "#555",
          fontSize: "14px",
          fontWeight: 500,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F5F5F5"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
      >
        + New savings pot
      </button>

      {/* Modals */}
      {contributingTo && (
        <ContributeModal pot={contributingTo} onClose={() => setContributingTo(null)} />
      )}
      {showCreate && (
        <CreatePotModal onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}
