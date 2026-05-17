// ✅ Safe Vercel serverless function
// Keys come from Vercel Environment Variables — NOT from this file!
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    GROQ_API_KEY:       process.env.GROQ_API_KEY        || '',
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY  || '',
    TAVILY_API_KEY:     process.env.TAVILY_API_KEY      || '',
    HF_API_KEY:         process.env.HF_API_KEY          || '',
    SUPABASE_URL:       process.env.SUPABASE_URL        || '',
    SUPABASE_ANON_KEY:  process.env.SUPABASE_ANON_KEY   || ''
  });
}
