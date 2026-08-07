export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { messages, json, max_tokens, temperature } = await req.json();

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages array required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = {
    model: 'llama-3.3-70b-versatile',
    max_tokens: max_tokens || 1024,
    temperature: temperature ?? 1,
    messages,
  };
  // JSON mode — Groq requires the word "json" to appear in the prompt
  if (json) body.response_format = { type: 'json_object' };

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await groqRes.json();

  return new Response(JSON.stringify(data), {
    status: groqRes.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
