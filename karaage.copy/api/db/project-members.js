const { createAuthClient, decodeJwtPayload } = require('../_utils/supabase');

module.exports = async (req, res) => {
  const token = req.cookies['sb-access-token'];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const payload = decodeJwtPayload(token);
  if (!payload || !payload.sub) return res.status(401).json({ error: 'Invalid session' });
  const userId = payload.sub;

  const supabaseClient = createAuthClient(token);

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
      .eq('user_id', userId);

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
      .eq('user_id', userId);

    if (memberCheckError) return res.status(500).json({ error: memberCheckError.message });
    if (memberCheck && memberCheck.length > 0) {
      return res.status(400).json({ error: 'Already a member' });
    }

    // 参加
    const { error: joinError } = await supabaseClient
      .from('project_members')
      .insert([{ project_id: targetProj.id, user_id: userId, role: 'editor' }]);

    if (joinError) return res.status(500).json({ error: joinError.message });

    return res.status(200).json({ project: targetProj });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
