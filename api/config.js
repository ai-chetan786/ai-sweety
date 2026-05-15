// ============================================================
//  AI-SWEETY — SAFE config.js  ✅ Safe to upload to GitHub
//  Keys are fetched from Vercel /api/env (never hardcoded)
// ============================================================

const SWEETY_CONFIG = {
  SUPABASE_URL:       "",
  SUPABASE_ANON_KEY:  "",
  GROQ_API_KEY:       "",
  GROQ_MODEL:         "llama3-70b-8192",
  OPENROUTER_API_KEY: "",
  OPENROUTER_MODEL:   "mistralai/mistral-7b-instruct",
  TAVILY_API_KEY:     "",
  HF_API_KEY:         "",
  HF_IMAGE_MODEL:     "stabilityai/stable-diffusion-xl-base-1.0",
  APP_NAME:           "AI Sweety",
  WATERMARK_TEXT:     "© AI Sweety",
  DEFAULT_LANGUAGE:   "en",
  SUPPORTED_LANGUAGES: [
    { code: "en", name: "English" },
    { code: "hi", name: "हिंदी" },
    { code: "ta", name: "தமிழ்" },
    { code: "te", name: "తెలుగు" },
    { code: "kn", name: "ಕನ್ನಡ" },
    { code: "ml", name: "മലയാളം" },
    { code: "mr", name: "मराठी" },
    { code: "bn", name: "বাংলা" },
    { code: "gu", name: "ગુજરાતી" },
    { code: "pa", name: "ਪੰਜਾਬੀ" },
    { code: "ur", name: "اردو" },
    { code: "ar", name: "العربية" },
    { code: "fr", name: "Français" },
    { code: "es", name: "Español" },
    { code: "zh", name: "中文" }
  ]
};

// ── Load keys safely from Vercel backend ─────────────────────
async function initConfig() {
  try {
    const res = await fetch("/api/env");
    const keys = await res.json();
    SWEETY_CONFIG.SUPABASE_URL       = keys.SUPABASE_URL;
    SWEETY_CONFIG.SUPABASE_ANON_KEY  = keys.SUPABASE_ANON_KEY;
    SWEETY_CONFIG.GROQ_API_KEY       = keys.GROQ_API_KEY;
    SWEETY_CONFIG.OPENROUTER_API_KEY = keys.OPENROUTER_API_KEY;
    SWEETY_CONFIG.TAVILY_API_KEY     = keys.TAVILY_API_KEY;
    SWEETY_CONFIG.HF_API_KEY         = keys.HF_API_KEY;
  } catch (e) {
    console.warn("Could not load env config:", e);
  }
}
// Auto-load when script is included
initConfig();

// ── GROQ API ──────────────────────────────────────────────────
async function callGroq(messages, systemPrompt = "") {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SWEETY_CONFIG.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: SWEETY_CONFIG.GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt || `You are AI Sweety, a helpful, friendly AI assistant. Always end your response with "© AI Sweety".` },
          ...messages
        ],
        max_tokens: 2048,
        temperature: 0.7
      })
    });
    if (!response.ok) throw new Error("Groq failed");
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (err) {
    console.warn("Groq failed, switching to OpenRouter...", err);
    return await callOpenRouter(messages, systemPrompt);
  }
}

// ── OPENROUTER FALLBACK ───────────────────────────────────────
async function callOpenRouter(messages, systemPrompt = "") {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SWEETY_CONFIG.OPENROUTER_API_KEY}`,
      "HTTP-Referer": window.location.origin,
      "X-Title": "AI Sweety"
    },
    body: JSON.stringify({
      model: SWEETY_CONFIG.OPENROUTER_MODEL,
      messages: [
        { role: "system", content: systemPrompt || `You are AI Sweety. Always end with "© AI Sweety".` },
        ...messages
      ]
    })
  });
  const data = await response.json();
  return data.choices[0].message.content;
}

// ── TAVILY SEARCH ─────────────────────────────────────────────
async function searchWeb(query) {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: SWEETY_CONFIG.TAVILY_API_KEY,
      query,
      search_depth: "basic",
      max_results: 5
    })
  });
  const data = await response.json();
  return data.results;
}

// ── HUGGING FACE IMAGE GENERATION ────────────────────────────
async function generateImage(prompt) {
  const response = await fetch(
    `https://api-inference.huggingface.co/models/${SWEETY_CONFIG.HF_IMAGE_MODEL}`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SWEETY_CONFIG.HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    }
  );
  if (!response.ok) throw new Error("Image generation failed");
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

// ── SUPABASE CLIENT ───────────────────────────────────────────
function getSupabase() {
  return window.supabase.createClient(
    SWEETY_CONFIG.SUPABASE_URL,
    SWEETY_CONFIG.SUPABASE_ANON_KEY
  );
}
