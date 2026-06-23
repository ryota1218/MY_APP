const { supabase } = require('../_utils/supabase');

module.exports = async (req, res) => {
  const token = req.cookies['sb-access-token'];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ylgumuwmpnnqzrfleyoc.supabase.co';
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsZ3VtdXdtcG5ucXpyZmxleW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNzA2MjgsImV4cCI6MjA5MTk0NjYyOH0.HP5miiB3Gbjvi0iDKgi9b1kXsf4FaOFY9AUt5fyun5Q';

  // トークン付きクライアントでRLSを通過
  const supabaseClient = require('@supabase/supabase-js').createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  // プロジェクト一覧取得 (GET)
  if (req.method === 'GET') {
    const { data: memberships, error } = await supabaseClient
      .from('project_members')
      .select(`
        role,
        joined_at,
        projects (
          id,
          name,
          account_id
        )
      `)
      .eq('user_id', user.id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ memberships });
  }

  // プロジェクト参加 (POST)
  if (req.method === 'POST') {
    const { projectId } = req.body || {};
    if (!projectId) return res.status(400).json({ error: 'Project ID is required' });

    // 存在チェック
    const { data: proj, error: checkError } = await supabaseClient
      .from('projects')
      .select('id, name')
      .eq('id', projectId);

    if (checkError) return res.status(500).json({ error: checkError.message });
    if (!proj || proj.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const targetProj = proj[0];

    // 重複チェック
    const { data: memberCheck, error: memberCheckError } = await supabaseClient
      .from('project_members')
      .select('role')
      .eq('project_id', targetProj.id)
      .eq('user_id', user.id);

    if (memberCheckError) return res.status(500).json({ error: memberCheckError.message });
    if (memberCheck && memberCheck.length > 0) {
      return res.status(400).json({ error: 'Already a member' });
    }

    // 参加
    const { error: joinError } = await supabaseClient
      .from('project_members')
      .insert([{ project_id: targetProj.id, user_id: user.id, role: 'editor' }]);

    if (joinError) return res.status(500).json({ error: joinError.message });

    return res.status(200).json({ project: targetProj });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
