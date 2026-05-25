// ✅ Vercel Serverless — File Upload to Supabase Storage
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { fileBase64, fileName, folder, contentType } = req.body;
    if (!fileBase64 || !fileName) return res.status(400).json({ error: 'File data required' });

    const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const base64Data = fileBase64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const path = `${folder || 'uploads'}/${Date.now()}_${fileName}`;

    const { error } = await sb.storage.from('sweety-media').upload(path, buffer, {
      contentType: contentType || 'image/jpeg',
      upsert: true
    });
    if (error) throw error;

    const { data: { publicUrl } } = sb.storage.from('sweety-media').getPublicUrl(path);
    return res.status(200).json({ success: true, url: publicUrl, path });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
