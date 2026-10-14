
import { apiResponse } from '../../server/api.js';

export default async function handler(req, res) {
  try {
    const artist = req.query.artist;

    const response = await apiResponse(
      new Request(
        `https://localhost/api/radio/${encodeURIComponent(artist)}`,
        { method: req.method }
      ),
      process.env
    );

    res.status(response.status);

    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    res.send(await response.text());
  } catch (error) {
    console.error('Radio API error:', error);
    res.status(500).json({ error: 'Station unavailable' });
  }
}
