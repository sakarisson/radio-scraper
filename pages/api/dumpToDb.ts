import { NextApiRequest, NextApiResponse } from 'next';
import { saveFromKvToDb } from '../../business/operations';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  saveFromKvToDb('kvf').then((result) => {
    response.status(200).json({
      body: result,
      query: request.query,
      cookies: request.cookies,
    });
  });
}
