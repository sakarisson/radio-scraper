import { z } from "zod";
import Link from "next/link";
import { getArtists } from "@/utils/database";
import { body, link } from "@/styles/typography.css";

const PAGE_SIZE = 30;

type Props = {
  searchParams?: unknown;
};

export default async function Artist(props: Props) {
  const paramsSchema = z
    .object({
      page: z.string().regex(/^\d+$/).transform(Number).optional(),
    })
    .optional();

  const getOffset = () => {
    const parsedSearchParams = paramsSchema.safeParse(props.searchParams);

    if (!parsedSearchParams.success) {
      return 0;
    }

    return (parsedSearchParams.data?.page ?? 0) * PAGE_SIZE;
  };

  const data = await getArtists(getOffset(), PAGE_SIZE);

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
      <div className={body}>Artist name</div>
      {parsed.data.map(({ id, name }) => (
        <Link href={`artists/${name}`} key={id}>
          <div className={[body, link].join(" ")}>{name}</div>
        </Link>
      ))}
    </div>
  );
}

export const dynamic = "force-dynamic";
