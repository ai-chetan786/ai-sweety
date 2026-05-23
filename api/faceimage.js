// ✅ Vercel Serverless Function — Face Style Transfer
// Uses Replicate API to apply styles to user's uploaded photo

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { imageBase64, prompt, style } = req.body;
  if (!imageBase64 || !prompt) {
    return res.status(400).json({ error: 'Image and prompt are required' });
  }

  const REPLICATE_KEY = process.env.REPLICATE_API_KEY;

  // If no Replicate key — use Pollinations with face description fallback
  if (!REPLICATE_KEY) {
    try {
      const enhancedPrompt = `${prompt}, photorealistic, detailed face, professional photography, high quality`;
      const encoded = encodeURIComponent(enhancedPrompt);
      const seed = Math.floor(Math.random() * 999999);
      const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=768&height=768&seed=${seed}&nologo=true&enhance=true`;
      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) throw new Error('Failed');
      const buf = await imgRes.arrayBuffer();
      const b64 = Buffer.from(buf).toString('base64');
      return res.status(200).json({
        success: true,
        image: `data:image/jpeg;base64,${b64}`,
        method: 'pollinations',
        note: 'Add REPLICATE_API_KEY to Vercel for real face transfer!'
      });
    } catch(e) {
      return res.status(500).json({ error: 'Image generation failed: ' + e.message });
    }
  }

  try {
    // Use Replicate — face-consistent image generation
    // Model: tencentarc/photomaker — generates images with your face
    const replicateRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: 'ddfc2b08d209f9fa8c1eca692712918bd449f695dabb4a958da31802a9570fe4',
        input: {
          prompt: `img, ${prompt}, high quality, detailed`,
          input_image: imageBase64,
          style_name: style || 'Photographic',
          num_outputs: 1,
          guidance_scale: 5,
          num_inference_steps: 20
        }
      })
    });

    const prediction = await replicateRes.json();
    if (!prediction.id) throw new Error('Failed to start prediction');

    // Poll for result
    let result = null;
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { 'Authorization': `Token ${REPLICATE_KEY}` }
      });
      const poll = await pollRes.json();
      if (poll.status === 'succeeded') {
        result = poll.output?.[0];
        break;
      }
      if (poll.status === 'failed') throw new Error('Generation failed');
    }

    if (!result) throw new Error('Timeout — try again');

    // Fetch the output image and convert to base64
    const outputRes = await fetch(result);
    const buf = await outputRes.arrayBuffer();
    const b64 = Buffer.from(buf).toString('base64');

    return res.status(200).json({
      success: true,
      image: `data:image/jpeg;base64,${b64}`,
      method: 'replicate-photomaker'
    });

  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
}
