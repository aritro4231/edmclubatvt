
import { apiResponse } from '../server/api.js';

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, 'https://localhost');

    const response = await apiResponse(
      new Request(url, { method: req.method }),
      process.env
    );

    if (!response) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.statusCode = response.status;

    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    res.end(await response.text());
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
