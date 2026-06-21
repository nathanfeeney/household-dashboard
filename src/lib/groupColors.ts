// Shared colour palette for user-defined groups (reminders, shopping lists).
// Keeps reminder + shopping groups visually consistent and uses the site tokens
// where sensible.

export type GroupColor =
  | "slate"
  | "green"
  | "blue"
  | "amber"
  | "coral"
  | "purple"
  | "teal"
  | "pink"
  | "indigo"
  | "lime";

export const GROUP_COLOR_MAP: Record<GroupColor, { bar: string; bg: string; text: string }> = {
  slate:  { bar: "#64748B", bg: "var(--clr-bg-alt)",        text: "var(--clr-ink-2)" },
  green:  { bar: "var(--clr-accent)", bg: "var(--clr-accent-light)", text: "var(--clr-accent-hover)" },
  blue:   { bar: "#378ADD", bg: "#E6F1FB", text: "#0C447C" },
  amber:  { bar: "#EF9F27", bg: "var(--clr-warning-bg)", text: "var(--clr-warning)" },
  coral:  { bar: "#D85A30", bg: "#FAECE7", text: "#4A1B0C" },
  purple: { bar: "#7F77DD", bg: "#EEEDFE", text: "#26215C" },
  teal:   { bar: "#2BB3B1", bg: "#E0F7F7", text: "#006969" },
  pink:   { bar: "#E46AA5", bg: "#F8E6F0", text: "#7B1A65" },
  indigo: { bar: "#4B63D6", bg: "#E8EAF6", text: "#1A237E" },
  lime:   { bar: "#A3C644", bg: "#F1F8E9", text: "#33691E" },
};

export const GROUP_COLOR_OPTIONS: GroupColor[] = [
  "slate", "green", "blue", "amber", "coral", "purple", "teal", "pink", "indigo", "lime",
];

export function groupColor(color: string): { bar: string; bg: string; text: string } {
  return GROUP_COLOR_MAP[(color as GroupColor)] ?? GROUP_COLOR_MAP.slate;
}
