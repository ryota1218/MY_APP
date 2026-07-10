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

  // POST: 譲渡リクエストを作成 (オーナーのみ実行可能)
  if (req.method === 'POST') {
    const { projectId, targetUserId } = req.body || {};
    if (!projectId || !targetUserId) return res.status(400).json({ error: 'Missing parameters' });

    // 自分がオーナーか確認
    const { data: member, error: memberError } = await supabaseClient
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (memberError || !member || member.role !== 'owner') {
      return res.status(403).json({ error: 'Only owners can transfer ownership' });
    }

    // projects テーブルの pending_owner_id を更新
    const { error: updateError } = await supabaseClient
      .from('projects')
      .update({ pending_owner_id: targetUserId })
      .eq('id', projectId);

    if (updateError) return res.status(500).json({ error: updateError.message });
    return res.status(200).json({ success: true });
  }

  // PUT: 譲渡リクエストを承認・拒否 (対象者のみ実行可能)
  if (req.method === 'PUT') {
    const { projectId, action } = req.body || {};
    if (!projectId || !action) return res.status(400).json({ error: 'Missing parameters' });

    // プロジェクト情報の取得
    const { data: project, error: projError } = await supabaseClient
      .from('projects')
      .select('pending_owner_id')
      .eq('id', projectId)
      .single();

    if (projError || !project) return res.status(404).json({ error: 'Project not found' });
    if (project.pending_owner_id !== userId) {
      return res.status(403).json({ error: 'You are not the pending owner for this project' });
    }

    if (action === 'reject') {
      // 拒否: pending_owner_id をクリア
      const { error: updateError } = await supabaseClient
        .from('projects')
        .update({ pending_owner_id: null })
        .eq('id', projectId);
      
      if (updateError) return res.status(500).json({ error: updateError.message });
      return res.status(200).json({ success: true, message: 'Transfer rejected' });
    } 
    
    if (action === 'approve') {
      // 承認: ロールの入れ替え
      // 1. 現在のオーナーを探す
      const { data: ownerMember, error: ownerError } = await supabaseClient
        .from('project_members')
        .select('user_id')
        .eq('project_id', projectId)
        .eq('role', 'owner')
        .single();
      
      if (ownerError || !ownerMember) return res.status(500).json({ error: 'Current owner not found' });
      const currentOwnerId = ownerMember.user_id;

      // 2. 現在のオーナーを editor に降格
      await supabaseClient
        .from('project_members')
        .update({ role: 'editor' })
        .eq('project_id', projectId)
        .eq('user_id', currentOwnerId);

      // 3. 自分を owner に昇格
      await supabaseClient
        .from('project_members')
        .update({ role: 'owner' })
        .eq('project_id', projectId)
        .eq('user_id', userId);

      // 4. pending_owner_id をクリア
      await supabaseClient
        .from('projects')
        .update({ pending_owner_id: null })
        .eq('id', projectId);

      return res.status(200).json({ success: true, message: 'Transfer approved' });
    }

    return res.status(400).json({ error: 'Invalid action' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
