const { supabase } = require('../_utils/supabase');

module.exports = async (req, res) => {
  // セッションの確認
  const token = req.cookies['sb-access-token'];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  // プロジェクト作成 (POST)
  if (req.method === 'POST') {
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ error: 'Project name is required' });

    const crypto = require('crypto');
    const newProjectId = crypto.randomUUID();

    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ylgumuwmpnnqzrfleyoc.supabase.co';
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsZ3VtdXdtcG5ucXpyZmxleW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNzA2MjgsImV4cCI6MjA5MTk0NjYyOH0.HP5miiB3Gbjvi0iDKgi9b1kXsf4FaOFY9AUt5fyun5Q';

    // Vercel BFFからSupabaseのRLSを通り抜けるため、リクエストにトークンをセット
    const supabaseClient = require('@supabase/supabase-js').createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: newProj, error: projError } = await supabaseClient
      .from('projects')
      .insert([{ id: newProjectId, name: name, account_id: user.id }])
      .select();

    if (projError) return res.status(500).json({ error: projError.message });

    const createdProject = newProj[0];

    const { error: memberError } = await supabaseClient
      .from('project_members')
      .insert([{ project_id: createdProject.id, user_id: user.id, role: 'owner' }]);

    if (memberError) return res.status(500).json({ error: memberError.message });

    return res.status(200).json({ project: createdProject });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
