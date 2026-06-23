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
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ error: 'projectId required' });

    const { data, error } = await supabaseClient
      .from('color')
      .select('main, sub, accent')
      .eq('project_id', projectId)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ data });
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const { project_id, main, sub, accent } = req.body;
    if (!project_id) return res.status(400).json({ error: 'project_id required' });

    const { data: existing } = await supabaseClient
      .from('color')
      .select('project_id')
      .eq('project_id', project_id)
      .maybeSingle();

    if (existing) {
      // 更新
      const { error } = await supabaseClient
        .from('color')
        .update({ main, sub, accent })
        .eq('project_id', project_id);
      if (error) return res.status(500).json({ error: error.message });
    } else {
      // 新規挿入
      const { error } = await supabaseClient
        .from('color')
        .insert([{ project_id, main, sub, accent }]);
      if (error) return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
