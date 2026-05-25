// ✅ Fixed Upload API — uses fetch directly, no npm packages needed!
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { fileBase64, fileName, folder, contentType } = req.body;
    if (!fileBase64 || !fileName) {
      return res.status(400).json({ error: 'fileBase64 and fileName are required' });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return res.status(500).json({ error: 'Supabase config missing in environment variables' });
    }

    // Convert base64 to buffer
    const base64Data = fileBase64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Build upload path
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${folder || 'uploads'}/${Date.now()}_${safeName}`;
    const mimeType = contentType || 'image/jpeg';

    // Upload directly to Supabase Storage REST API
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/sweety-media/${path}`;
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': mimeType,
        'x-upsert': 'true'
      },
      body: buffer
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error('Supabase upload error:', uploadRes.status, errText);
      return res.status(500).json({ error: `Upload failed: ${uploadRes.status} - ${errText}` });
    }

    // Build public URL
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/sweety-media/${path}`;

    return res.status(200).json({
      success: true,
      url: publicUrl,
      path: path
    });

  } catch (err) {
    console.error('Upload handler error:', err);
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
}
