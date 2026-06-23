const { supabase } = require('../_utils/supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.cookies['sb-access-token'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid session' });

  const supabaseClient = require('@supabase/supabase-js').createClient(
    process.env.SUPABASE_URL || 'https://ylgumuwmpnnqzrfleyoc.supabase.co',
    process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsZ3VtdXdtcG5ucXpyZmxleW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNzA2MjgsImV4cCI6MjA5MTk0NjYyOH0.HP5miiB3Gbjvi0iDKgi9b1kXsf4FaOFY9AUt5fyun5Q',
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  try {
    const { fileData, fileName, mimeType } = req.body;
    if (!fileData) return res.status(400).json({ error: 'Missing file data' });

    // base64バッファに変換
    const base64Data = fileData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const filePath = `${user.id}-${fileName}`;

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
