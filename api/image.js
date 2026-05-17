// ✅ Vercel Serverless Function — Image Generation
// Calls HuggingFace from SERVER side — no CORS issues!
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  const HF_KEY = process.env.HF_API_KEY;
  if (!HF_KEY) return res.status(500).json({ error: 'HuggingFace key not configured' });

  // Try multiple free models in order
  const models = [
    'stabilityai/stable-diffusion-2-1',
    'runwayml/stable-diffusion-v1-5',
    'CompVis/stable-diffusion-v1-4'
  ];

  for (const model of models) {
    try {
      console.log(`Trying model: ${model}`);
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HF_KEY}`,
            'Content-Type': 'application/json',
            'x-wait-for-model': 'true'
          },
          body: JSON.stringify({
            inputs: prompt,
            options: { wait_for_model: true }
          })
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`Model ${model} failed:`, response.status, errText);
        // If model loading, try next
        if (response.status === 503) continue;
        continue;
      }

      // Get image as buffer
      const imageBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(imageBuffer).toString('base64');
      const contentType = response.headers.get('content-type') || 'image/jpeg';

      return res.status(200).json({
        success: true,
        image: `data:${contentType};base64,${base64}`,
        model: model
      });

    } catch (err) {
      console.warn(`Model ${model} error:`, err.message);
      continue;
    }
  }

  return res.status(500).json({
    error: 'All image models are currently loading. Please try again in 30 seconds!'
  });
}
