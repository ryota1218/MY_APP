const { supabase } = require('../_utils/supabase');

module.exports = async (req, res) => {
  const token = req.cookies['sb-access-token'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return res.status(401).json({ error: 'Invalid session' });

  const supabaseClient = require('@supabase/supabase-js').createClient(
    process.env.SUPABASE_URL || 'https://ylgumuwmpnnqzrfleyoc.supabase.co',
    process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsZ3VtdXdtcG5ucXpyZmxleW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNzA2MjgsImV4cCI6MjA5MTk0NjYyOH0.HP5miiB3Gbjvi0iDKgi9b1kXsf4FaOFY9AUt5fyun5Q',
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  if (req.method === 'GET') {
    const { data: profile, error } = await supabaseClient
      .from('users')
      .select('name, icon')
      .eq('id', user.id)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ profile: profile || null });
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const { name, icon } = req.body || {};
    
    const { error } = await supabaseClient
      .from('users')
      .upsert({
        id: user.id,
        name: name,
        icon: icon,
        update_at: new Date().toISOString()
      });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
