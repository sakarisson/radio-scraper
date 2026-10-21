import * as ui from "@/styles/ui.css";

export function Stats({
  items,
}: {
  items: { value: React.ReactNode; label: React.ReactNode }[];
}) {
  return (
    <div className={ui.stats}>
      {items.map(({ value, label }, i) => (
        <div key={i} className={ui.stat}>
          <span className={ui.statValue}>{value}</span>
          <span className={ui.statLabel}>{label}</span>
        </div>
      ))}
    </div>
  );
}
