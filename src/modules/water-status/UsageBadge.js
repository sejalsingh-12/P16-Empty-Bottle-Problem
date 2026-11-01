// Small coloured label for the usage / crowd status.
// (Module 2 only. The shared StatusBadge is left untouched.)

const usageColors = {
  Low: "green",
  Normal: "yellow",
  Crowded: "orange",
};

export default function UsageBadge({ label }) {
  const color = usageColors[label] || "grey";
  return <span className={`badge badge-${color}`}>👥 {label}</span>;
}
