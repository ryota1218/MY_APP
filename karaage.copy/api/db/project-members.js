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

  // GET: プロジェクト一覧取得 または 特定プロジェクトのメンバー一覧取得
  if (req.method === 'GET') {
    const { projectId } = req.query || {};

    if (projectId) {
      // 特定のプロジェクトのメンバー一覧を取得
      // （※RLSにより、自分が所属しているプロジェクトのみ取得可能）
      const { data: members, error } = await supabaseClient
        .from('project_members')
        .select(`
          project_id,
          user_id,
          role,
          joined_at,
          users (
            id,
            name,
            icon
          )
        `)
        .eq('project_id', projectId);

      const { data: projectData, error: projError } = await supabaseClient
        .from('projects')
        .select('pending_owner_id')
        .eq('id', projectId)
        .single();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ 
        members, 
        pendingOwnerId: projectData ? projectData.pending_owner_id : null 
      });
    } else {
      // 自分が所属するプロジェクト一覧を取得
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
  }

  // プロジェクト参加 (POST)
  if (req.method === 'POST') {
    const { projectId } = req.body || {};
    if (!projectId) return res.status(400).json({ error: 'Project ID is required' });

    // 重複チェック
    const { data: memberCheck, error: memberCheckError } = await supabaseClient
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', userId);

    if (memberCheckError) return res.status(500).json({ error: memberCheckError.message });
    if (memberCheck && memberCheck.length > 0) {
      return res.status(400).json({ error: 'Already a member' });
    }

    // 先に参加登録（INSERT）を行う
    // これにより、RLS（自分が所属しているプロジェクトのみ参照可能）をクリアできる
    const { error: joinError } = await supabaseClient
      .from('project_members')
      .insert([{ project_id: projectId, user_id: userId, role: 'editor' }]);

    // 存在しないプロジェクトIDの場合は外部キー制約エラーになる
    if (joinError) {
      if (joinError.code === '23503') { // foreign_key_violation
        return res.status(404).json({ error: 'Project not found' });
      }
      // invalid input syntax for type uuid の場合は22P02
      if (joinError.code === '22P02') {
        return res.status(404).json({ error: 'Invalid Project ID format' });
      }
      return res.status(500).json({ error: joinError.message });
    }

    // 参加後にプロジェクト情報を取得（RLSを通過できる）
    const { data: proj, error: checkError } = await supabaseClient
      .from('projects')
      .select('id, name')
      .eq('id', projectId);

    if (checkError) return res.status(500).json({ error: checkError.message });
    if (!proj || proj.length === 0) {
      // 基本的にあり得ないが念のため
      return res.status(404).json({ error: 'Project not found after join' });
    }

    const targetProj = proj[0];

    return res.status(200).json({ project: targetProj });
  }

  // プロジェクトメンバーの権限更新 (PUT)
  if (req.method === 'PUT') {
    const { projectId, targetUserId, role } = req.body || {};
    if (!projectId || !targetUserId || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 更新できる権限があるか（自分がオーナーか）チェック
    // ※今回は簡易的に実装。本来はOwnerのみ等のバリデーションが必要
    const { data: myMember, error: myCheckError } = await supabaseClient
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (myCheckError || !myMember || myMember.role !== 'owner') {
      return res.status(403).json({ error: '権限がありません（Ownerのみ可能）' });
    }

    const { error: updateError } = await supabaseClient
      .from('project_members')
      .update({ role })
      .eq('project_id', projectId)
      .eq('user_id', targetUserId);

    if (updateError) return res.status(500).json({ error: updateError.message });
    return res.status(200).json({ success: true });
  }

  // プロジェクトメンバーの追放・退出 (DELETE)
  if (req.method === 'DELETE') {
    const { projectId, targetUserId } = req.body || {};
    if (!projectId || !targetUserId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 自分が退出する場合はOK、他メンバーを追放する場合は自分がOwnerである必要がある
    if (userId !== targetUserId) {
      const { data: myMember, error: myCheckError } = await supabaseClient
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single();

      if (myCheckError || !myMember || myMember.role !== 'owner') {
        return res.status(403).json({ error: '権限がありません（Ownerのみ可能）' });
      }
    }

    const { error: deleteError } = await supabaseClient
      .from('project_members')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', targetUserId);

    if (deleteError) return res.status(500).json({ error: deleteError.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
