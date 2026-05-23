// ✅ Vercel Serverless Function — Image Generation
// Uses Pollinations.ai — 100% FREE, no API key needed!
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  try {
    // Pollinations.ai — completely FREE, no API key needed!
    const encodedPrompt = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 999999);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=768&seed=${seed}&nologo=true&enhance=true`;

    // Fetch the image from Pollinations
    const response = await fetch(imageUrl);
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
    // Fallback: return direct URL (works without base64)
    try {
      const encodedPrompt = encodeURIComponent(prompt);
      const seed = Math.floor(Math.random() * 999999);
      const directUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=768&seed=${seed}&nologo=true`;
      return res.status(200).json({
        success: true,
        image: directUrl,
        model: 'pollinations-direct'
      });
    } catch(e2) {
      return res.status(500).json({ error: 'Image generation failed: ' + err.message });
    }
  }
}
