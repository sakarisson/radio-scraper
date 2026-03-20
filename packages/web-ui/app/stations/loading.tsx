import * as skeleton from "@/styles/loading.css";

export default function Loading() {
  return (
    <div>
      <div className={skeleton.skeletonHeading} />
      <div className={skeleton.skeletonStatGrid}>
        <div className={skeleton.skeletonStatCard} style={{ height: "140px" }} />
        <div className={skeleton.skeletonStatCard} style={{ height: "140px" }} />
        <div className={skeleton.skeletonStatCard} style={{ height: "140px" }} />
      </div>
    </div>
  );
}
