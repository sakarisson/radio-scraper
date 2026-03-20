import * as skeleton from "@/styles/loading.css";

export default function Loading() {
  return (
    <div>
      <div className={skeleton.skeletonBack} />
      <div className={skeleton.skeletonHeading} />
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className={skeleton.skeletonTableRow}>
          <div className={skeleton.skeletonCell} />
          <div className={skeleton.skeletonCell} />
          <div className={skeleton.skeletonCell} />
        </div>
      ))}
    </div>
  );
}
