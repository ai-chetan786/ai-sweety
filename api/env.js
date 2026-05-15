// ============================================================
//  Vercel Serverless Function — /api/env
//  This safely sends keys from Vercel Environment Variables
//  to your frontend WITHOUT exposing them in GitHub code
// ============================================================

export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Send keys from Vercel Environment Variables to frontend
  res.status(200).json({
    SUPABASE_URL:       process.env.SUPABASE_URL       || "",
    SUPABASE_ANON_KEY:  process.env.SUPABASE_ANON_KEY  || "",
    GROQ_API_KEY:       process.env.GROQ_API_KEY        || "",
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY  || "",
    TAVILY_API_KEY:     process.env.TAVILY_API_KEY      || "",
    HF_API_KEY:         process.env.HF_API_KEY          || ""
  });
}
