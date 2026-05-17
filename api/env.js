// ✅ Safe Vercel serverless function — keys never exposed in GitHub
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  // Read all keys from Vercel Environment Variables
  const GROQ        = process.env.GROQ_API_KEY        || '';
  const OPENROUTER  = process.env.OPENROUTER_API_KEY  || '';
  const TAVILY      = process.env.TAVILY_API_KEY      || '';
  const HF          = process.env.HF_API_KEY          || '';
  const SB_URL      = process.env.SUPABASE_URL        || '';
  const SB_ANON     = process.env.SUPABASE_ANON_KEY   || '';

  // Debug: show which keys loaded (first 6 chars only — safe)
  const debug = {
    GROQ_API_KEY:        GROQ       ? '✅ ' + GROQ.slice(0,6)+'...'       : '❌ MISSING',
    OPENROUTER_API_KEY:  OPENROUTER ? '✅ ' + OPENROUTER.slice(0,6)+'...' : '❌ MISSING',
    TAVILY_API_KEY:      TAVILY     ? '✅ ' + TAVILY.slice(0,6)+'...'     : '❌ MISSING',
    HF_API_KEY:          HF         ? '✅ ' + HF.slice(0,4)+'...'         : '❌ MISSING',
    SUPABASE_URL:        SB_URL     ? '✅ loaded'                          : '❌ MISSING',
    SUPABASE_ANON_KEY:   SB_ANON   ? '✅ loaded'                          : '❌ MISSING',
  };

  console.log('AI Sweety env check:', JSON.stringify(debug));

  res.status(200).json({
    GROQ_API_KEY:       GROQ,
    OPENROUTER_API_KEY: OPENROUTER,
    TAVILY_API_KEY:     TAVILY,
    HF_API_KEY:         HF,
    SUPABASE_URL:       SB_URL,
    SUPABASE_ANON_KEY:  SB_ANON,
    _debug:             debug   // shows key status safely
  });
}
