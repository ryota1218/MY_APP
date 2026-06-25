const { createAuthClient, decodeJwtPayload } = require('../_utils/supabase');

module.exports = async (req, res) => {
  const token = req.cookies['sb-access-token'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const payload = decodeJwtPayload(token);
  if (!payload || !payload.sub) return res.status(401).json({ error: 'Invalid session' });
  const userId = payload.sub;

  const supabaseClient = createAuthClient(token);

  if (req.method === 'GET') {
    const { data: profile, error } = await supabaseClient
      .from('users')
      .select('name, icon')
      .eq('id', userId)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ profile: profile || null });
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const { name, icon } = req.body || {};
    
    const { error } = await supabaseClient
      .from('users')
      .upsert({
        id: userId,
        name: name,
        icon: icon,
        update_at: new Date().toISOString()
      });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
