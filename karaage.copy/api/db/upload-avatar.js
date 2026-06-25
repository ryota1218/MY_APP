const { createAuthClient, decodeJwtPayload } = require('../_utils/supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.cookies['sb-access-token'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const payload = decodeJwtPayload(token);
  if (!payload || !payload.sub) return res.status(401).json({ error: 'Invalid session' });
  const userId = payload.sub;

  const supabaseClient = createAuthClient(token);

  try {
    const { fileData, fileName, mimeType } = req.body;
    if (!fileData) return res.status(400).json({ error: 'Missing file data' });

    // base64バッファに変換
    const base64Data = fileData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const filePath = `${userId}-${fileName}`;

    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('avatars')
      .upload(filePath, buffer, {
        contentType: mimeType || 'image/png',
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabaseClient.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return res.status(200).json({ publicUrl });
  } catch (err) {
    console.error('Avatar upload error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};
