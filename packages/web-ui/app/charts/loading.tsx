import * as skeleton from "@/styles/loading.css";

export default function Loading() {
  return (
    <div>
      <div className={skeleton.skeletonHeading} />
      <div
        className={skeleton.skeletonRow}
        style={{ width: "200px", margin: "0 auto", marginBottom: "32px" }}
      />
      <div className={skeleton.skeletonStatGrid} style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div className={skeleton.skeletonStatCard} style={{ height: "300px" }} />
        <div className={skeleton.skeletonStatCard} style={{ height: "300px" }} />
      </div>
    </div>
  );
}
