// ✅ Face Style using Pollinations.ai — 100% FREE, no API key needed!
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt, style } = req.body;
  if (!prompt && !style) return res.status(400).json({ error: 'Prompt required' });

  try {
    const stylePrompts = {
      'Cinematic': 'cinematic movie still, dramatic lighting, film grain, professional photography, ultra realistic',
      'Anime': 'anime art style, detailed anime illustration, vibrant colors, Studio Ghibli inspired',
      'Digital Art': 'digital art, concept art, detailed illustration, trending on artstation, 4k',
      'Fantasy art': 'epic fantasy art, magical atmosphere, mystical lighting, detailed fantasy illustration',
      'Neon punk': 'cyberpunk neon lights, futuristic city, neon glow, dark atmosphere, blade runner style',
      'Comic book': 'comic book art style, bold lines, vibrant colors, Marvel Comics style, detailed illustration',
      'Photographic': 'professional portrait photography, studio lighting, sharp focus, high resolution DSLR'
    };

    const styleDesc = stylePrompts[style] || stylePrompts['Cinematic'];
    const fullPrompt = `${prompt}, ${styleDesc}, high quality, detailed, masterpiece`;
    const encoded = encodeURIComponent(fullPrompt);
    const seed = Math.floor(Math.random() * 999999);
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=768&height=768&seed=${seed}&nologo=true&enhance=true`;

    const response = await fetch(imageUrl, { headers: { 'User-Agent': 'AI-Sweety/1.0' } });
    if (!response.ok) throw new Error(`Image fetch failed: ${response.status}`);

    const imageBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(imageBuffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return res.status(200).json({
      success: true,
      image: `data:${contentType};base64,${base64}`,
      model: 'pollinations-ai'
    });
  } catch (err) {
    // Fallback: return direct URL
    const encoded = encodeURIComponent(`${prompt}, ${style} art style, high quality`);
    const seed = Math.floor(Math.random() * 999999);
    return res.status(200).json({
      success: true,
      image: `https://image.pollinations.ai/prompt/${encoded}?width=768&height=768&seed=${seed}&nologo=true`,
      model: 'pollinations-direct'
    });
  }
}
