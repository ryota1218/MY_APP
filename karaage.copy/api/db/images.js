const { supabase, createAuthClient } = require('../_utils/supabase');

module.exports = async (req, res) => {
  const token = req.cookies['sb-access-token'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const supabaseClient = createAuthClient(token);

  // ダッシュボード等の一覧取得・個別取得 (GET)
  if (req.method === 'GET') {
    const { projectId, id } = req.query;

    if (id) {
      // 個別取得
      const { data, error } = await supabaseClient
        .from('images')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ data });
    } else if (projectId) {
      // プロジェクト単位で取得
      const { data, error } = await supabaseClient
        .from('images')
        .select('id, name, stats, chart_type, create_at, update_att')
        .eq('project_id', projectId)
        .order('update_att', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ data });
    }

    return res.status(400).json({ error: 'projectId or id required' });
  }

  // 保存 (POST / PUT)
  if (req.method === 'POST' || req.method === 'PUT') {
    const { id, project_id, name, chart_type, json, preview_url, stats } = req.body;
    if (!project_id) return res.status(400).json({ error: 'project_id required' });

    // 新規か既存かでupsert
    const payload = {
      project_id,
      name,
      chart_type,
      json,
      update_att: new Date().toISOString()
    };

    if (id) payload.id = id;
    if (preview_url) payload.preview_url = preview_url;
    if (stats) payload.stats = stats;
    // create_at is default now

    const { data, error } = await supabaseClient
      .from('images')
      .upsert(payload)
      .select();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ data: data ? data[0] : null });
  }

  // 削除 (DELETE)
  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'id required' });

    const { error } = await supabaseClient
      .from('images')
      .delete()
      .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
