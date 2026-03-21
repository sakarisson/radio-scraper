import * as skeleton from "@/styles/loading.css";
import * as styles from "@/styles/artists.css";

export default function Loading() {
  return (
    <div>
      <div className={skeleton.skeletonHeading} />

      {/* Featured section skeleton */}
      <div className={styles.featuredSection}>
        <div className={styles.featuredHeader}>
          <div
            className={skeleton.skeletonRow}
            style={{ width: "140px", margin: 0 }}
          />
          <div
            className={skeleton.skeletonRow}
            style={{ width: "100px", margin: 0 }}
          />
        </div>
        <div className={styles.featuredGrid}>
          {[0, 1].map((col) => (
            <div key={col} className={styles.featuredCard}>
              {Array.from({ length: col === 0 ? 3 : 2 }, (_, i) => (
                <div
                  key={i}
                  className={skeleton.skeletonRow}
                  style={{ height: "32px" }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard header skeleton */}
      <div className={styles.leaderboardHeader}>
        <div
          className={skeleton.skeletonRow}
          style={{ width: "100px", margin: 0 }}
        />
        <div
          className={skeleton.skeletonRow}
          style={{ width: "50px", margin: 0 }}
        />
      </div>

      <div className={skeleton.skeletonSearch} />

      {/* Leaderboard rows skeleton */}
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className={skeleton.skeletonRow}
          style={{ height: "44px" }}
        />
      ))}
    </div>
  );
}
