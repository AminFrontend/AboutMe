import { handleContact } from '../server/contact-service.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      message: 'Метод не поддерживается.'
    });
  }

  const result = await handleContact(parseBody(req.body));
  return res.status(result.status).json(result.body);
}

function parseBody(body) {
  if (typeof body !== 'string') {
    return body;
  }

  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}
