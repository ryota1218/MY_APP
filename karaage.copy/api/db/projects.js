const { createAuthClient, decodeJwtPayload } = require('../_utils/supabase');

module.exports = async (req, res) => {
  // セッションの確認
  const token = req.cookies['sb-access-token'];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const payload = decodeJwtPayload(token);
  if (!payload || !payload.sub) return res.status(401).json({ error: 'Invalid session' });
  const userId = payload.sub;

  // プロジェクト作成 (POST)
  if (req.method === 'POST') {
    const { name } = req.body || {};
    if (!name) return res.status(400).json({ error: 'Project name is required' });

    const crypto = require('crypto');
    const newProjectId = crypto.randomUUID();

    const supabaseClient = createAuthClient(token);

    const { data: newProj, error: projError } = await supabaseClient
      .from('projects')
      .insert([{ id: newProjectId, name: name, account_id: userId }])
      .select();

    if (projError) return res.status(500).json({ error: projError.message });

    const createdProject = newProj[0];

    const { error: memberError } = await supabaseClient
      .from('project_members')
      .insert([{ project_id: createdProject.id, user_id: userId, role: 'owner' }]);

    if (memberError) return res.status(500).json({ error: memberError.message });

    return res.status(200).json({ project: createdProject });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
