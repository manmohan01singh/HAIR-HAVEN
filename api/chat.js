// api/chat.js
// Vercel Serverless Function to keep the Groq API Key safe in production!

export default async function handler(req, res) {
  // Set CORS headers for local/cross-origin testing
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Please send a POST request.' });
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request body. "messages" must be an array.' });
  }

  // Get Groq API Key from server-side environment variables
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'Groq API Key is not configured on the server. Please set the GROQ_API_KEY environment variable.' 
    });
  }

  try {
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: messages,
        temperature: 0.5,
        max_tokens: 1024
      })
    });

    if (!groqResponse.ok) {
      const errData = await groqResponse.json().catch(() => ({}));
      return res.status(groqResponse.status).json({
        error: errData?.error?.message || `Groq API responded with status ${groqResponse.status}`
      });
    }

    const data = await groqResponse.json();
    const assistantMessage = data.choices[0].message.content;

    return res.status(200).json({ content: assistantMessage });
  } catch (error) {
    console.error('Error in chat api:', error);
    return res.status(500).json({ error: 'Internal Server Error: ' + error.message });
  }
}
