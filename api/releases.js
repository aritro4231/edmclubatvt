
import { apiResponse } from '../server/api.js';

export default async function handler(req, res) {
  try {
    const response = await apiResponse(
      new Request('https://localhost/api/releases', {
        method: req.method
      }),
      process.env
    );

    res.statusCode = response.status;

    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    res.end(await response.text());
  } catch (error) {
    console.error('Releases API error:', error);
    res.status(500).json({ error: 'Releases unavailable' });
  }
}
