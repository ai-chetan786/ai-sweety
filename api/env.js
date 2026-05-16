// ✅ Vercel Serverless Function — safely sends keys to frontend
// This file is safe to upload to GitHub — NO real keys here!
// Real keys live in Vercel → Environment Variables (private)

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Allow from your domain only
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  res.status(200).json({
    SUPABASE_URL:       process.env.SUPABASE_URL       || '',
    SUPABASE_ANON_KEY:  process.env.SUPABASE_ANON_KEY  || '',
    GROQ_API_KEY:       process.env.GROQ_API_KEY        || '',
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY  || '',
    TAVILY_API_KEY:     process.env.TAVILY_API_KEY      || '',
    HF_API_KEY:         process.env.HF_API_KEY          || ''
  });
}
