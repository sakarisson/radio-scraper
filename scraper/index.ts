import { z } from "zod";
import dotenv from "dotenv";
import { sql } from "@vercel/postgres";

dotenv.config();

const url = process.env.STATION_URL_RAS_2;

const schema = z.object({
  data: z.object({
    title: z.string(),
    start_time: z.string(),
  }),
});

const getSong = async () => {
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

const init = async () => {
  const song = await getSong();
  const parsed = schema.parse(song);

  const { rows } = await sql`SELECT * from artists`;

  console.log(rows);
};

init();
