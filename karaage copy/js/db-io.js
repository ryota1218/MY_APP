/**
 * Supabase データベースと図データ（ダイアグラム）の同期を行う共通モジュール
 */
const DBIO = {
  /**
   * 現在選択中のプロジェクトIDを取得
   */
  getCurrentProjectId() {
    return localStorage.getItem('current_project_id');
  },

  /**
   * 図データをSupabaseのpublic.imagesテーブルに保存する
   * @param {string} diagramType - 図の種類 (arch, uml, st, layout, er)
   * @param {object} data - シリアライズされた図データ
   * @returns {Promise<boolean>} 保存に成功したかどうか
   */
  async saveDiagramToDB(diagramType, data) {
    const projectId = this.getCurrentProjectId();
    if (!projectId) {
      console.warn('[DBIO] プロジェクトが選択されていないため、DB保存をスキップします。');
      return false;
    }

    try {
      const nameKey = `${projectId}_${diagramType}`;
      const chartJson = JSON.stringify(data);
      const statsInfo = JSON.stringify({
        nodeCount: data.nodes ? data.nodes.length : (data.elements ? data.elements.length : 0),
        connCount: data.connections ? data.connections.length : 0,
        updatedAt: new Date().toISOString()
      });

      // 既存のレコードがあるか確認
      const { data: existing, error: selectError } = await window.supabaseClient
        .from('images')
        .select('id')
        .eq('name', nameKey)
        .maybeSingle();

      if (selectError) throw selectError;

      if (existing) {
        // 更新
        const { error: updateError } = await window.supabaseClient
          .from('images')
          .update({
            chart: chartJson,
            stats: statsInfo,
            update_att: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;
        console.log(`[DBIO] 図の更新に成功しました: ${nameKey}`);
      } else {
        // 新規挿入
        const newId = crypto.randomUUID();
        const { error: insertError } = await window.supabaseClient
          .from('images')
          .insert([
            {
              id: newId,
              project_id: projectId,
              name: nameKey,
              chart: chartJson,
              stats: statsInfo
            }
          ]);

        if (insertError) throw insertError;
        console.log(`[DBIO] 図の新規保存に成功しました: ${nameKey}`);
      }

      return true;
    } catch (err) {
      console.error('[DBIO] 図データの保存に失敗しました:', err);
      const errMsg = err.message || err.details || '不明なエラー';
      showToast(`DB保存エラー: ${errMsg}`, 'danger');
      return false;
    }
  },

  /**
   * Supabaseのpublic.imagesテーブルから図データを読み込む
   * @param {string} diagramType - 図の種類 (arch, uml, st, layout, er)
   * @returns {Promise<object|null>} 復元されたデータ、または存在しない場合はnull
   */
  async loadDiagramFromDB(diagramType) {
    const projectId = this.getCurrentProjectId();
    if (!projectId) {
      console.warn('[DBIO] プロジェクトが選択されていないため、DB読み込みをスキップします。');
      return null;
    }

    try {
      const nameKey = `${projectId}_${diagramType}`;
      const { data, error } = await window.supabaseClient
        .from('images')
        .select('chart')
        .eq('name', nameKey)
        .maybeSingle();

      if (error) throw error;

      if (data && data.chart) {
        return JSON.parse(data.chart);
      }
      return null;
    } catch (err) {
      console.error('[DBIO] 図データの読み込みに失敗しました:', err);
      return null;
    }
  }
};

window.DBIO = DBIO;
