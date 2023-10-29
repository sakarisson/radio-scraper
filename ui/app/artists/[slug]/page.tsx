import Database from "better-sqlite3";
import { z } from "zod";
import { Fragment } from "react";
import { database } from "@/utils/database";
import format from "date-fns/format";
import { fi } from "date-fns/locale";

export default function Artist({ params }: { params: { slug: string } }) {
  const data = database
    .prepare(
      `
      SELECT 
        a.name AS artist, 
        s.title AS title,
        p.time_played AS time_played,
        st.slug AS station,
        p.id as id
      FROM artists AS a
      JOIN songs AS s ON a.id = s.artist_id
      JOIN plays AS p ON s.id = p.song_id
      JOIN stations AS st ON p.station_id = st.id
      WHERE a.name COLLATE NOCASE = (?)
      ORDER BY p.time_played DESC;
  `
    )
    .all(decodeURIComponent(params.slug));

  const schema = z.array(
    z.object({
      artist: z.string(),
      title: z.string(),
      time_played: z.string(),
      station: z.string(),
      id: z.number(),
    })
  );

  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    return (
      <div>
        <h1>Error</h1>
        <p>{parsed.error.message}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
      }}
    >
      <div>Title</div>
      <div>Time Played</div>
      <div>Station</div>
      {parsed.data.map(({ artist, title, time_played, station, id }) => (
        <Fragment key={id}>
          <div>{title}</div>
          <div>
            {format(new Date(time_played), "PP p", {
              locale: fi,
            })}
          </div>
          <div>{station}</div>
        </Fragment>
      ))}
    </div>
  );
}
