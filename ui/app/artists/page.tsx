import Database from "better-sqlite3";
import { z } from "zod";
import Link from "next/link";
import { Fragment } from "react";
import { database } from "@/utils/database";

export default function Artist({ params }: { params: { slug: string } }) {
  const data = database
    .prepare(
      `
    select id, name from artists
    order by name asc
  `
    )
    .all();

  const schema = z.array(
    z.object({
      id: z.number(),
      name: z.string(),
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
        gridTemplateColumns: "1fr",
      }}
    >
      <div>Artist name</div>
      {parsed.data.map(({ id, name }) => (
        <Link href={`artists/${name}`} key={id}>
          <div>
            {name}, {id}
          </div>
        </Link>
      ))}
    </div>
  );
}
