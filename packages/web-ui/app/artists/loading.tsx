import * as skeleton from "@/styles/loading.css";

export default function Loading() {
  return (
    <div>
      <div className={skeleton.skeletonHeading} />
      <div className={skeleton.skeletonSearch} />
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={i}
          className={skeleton.skeletonRow}
          style={{ width: `${60 + Math.random() * 30}%` }}
        />
      ))}
    </div>
  );
}
