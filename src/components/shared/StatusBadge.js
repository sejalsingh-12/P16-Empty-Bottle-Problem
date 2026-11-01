// A small coloured label used in all modules.
// Example: <StatusBadge label="Available" />

const colorMap = {
  Available: "green",
  Clean: "green",
  Working: "green",
  Cold: "blue",
  Normal: "yellow",
  Average: "yellow",
  Warm: "orange",
  "Not Available": "red",
  Dirty: "red",
  "Not Working": "red",
};

export default function StatusBadge({ label }) {
  const color = colorMap[label] || "grey";
  return <span className={`badge badge-${color}`}>{label}</span>;
}
