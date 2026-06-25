const { supabase, createAuthClient } = require('../_utils/supabase');

module.exports = async (req, res) => {
  const token = req.cookies['sb-access-token'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const supabaseClient = createAuthClient(token);

  if (req.method === 'GET') {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ error: 'projectId required' });

    const { data, error } = await supabaseClient
      .from('gantt')
      .select('id, json')
      .eq('project_id', projectId)
      .maybeSingle();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ data });
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const { project_id, json } = req.body;
    if (!project_id) return res.status(400).json({ error: 'project_id required' });

    // まず既存レコードがあるかチェック
    const { data: existing } = await supabaseClient
      .from('gantt')
      .select('id')
      .eq('project_id', project_id)
      .maybeSingle();

    const payload = {
      project_id,
      json
    };
    if (existing && existing.id) {
      payload.id = existing.id;
    }

    const { data, error } = await supabaseClient
      .from('gantt')
      .upsert(payload);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
