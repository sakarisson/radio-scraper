import { NextApiRequest, NextApiResponse } from "next";
import { updateSongs } from "../../business/operations";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  return updateSongs()
    .then((result) => {
      response.status(200).json({
        body: result,
        query: request.query,
        cookies: request.cookies,
      });
    })
    .catch((error) => {
      response.status(500).json({
        error,
      });
    });
}
