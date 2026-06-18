import type { PackRow, ShotRow } from '../types';

export async function savePack(db: D1Database, pack: PackRow) {
  await db.prepare(`
    INSERT OR IGNORE INTO ideas (idea_id, status, trend_name, niche, notes, created_at)
    VALUES (?, 'scouted', ?, '', ?, ?)
  `).bind(pack.idea_id, pack.trend_title, pack.notes, pack.created_at).run();

  await db.prepare(`
    INSERT INTO packs (pack_id, idea_id, trend_title, status, content_type, story_pattern,
      visual_anchor, editing_style, thumbnail_scene, expected_stage_count, storyboard_json,
      discord_thread_id, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    pack.pack_id, pack.idea_id, pack.trend_title, pack.status, pack.content_type,
    pack.story_pattern, pack.visual_anchor, pack.editing_style, pack.thumbnail_scene,
    pack.expected_stage_count, pack.storyboard_json, pack.discord_thread_id,
    pack.notes, pack.created_at
  ).run();
}

export async function saveShots(db: D1Database, shots: ShotRow[]) {
  for (const s of shots) {
    await db.prepare(`
      INSERT INTO shots (pack_id, shot_number, status, scene_json, image_prompt,
        video_prompt_cn, duration, face_drift_risk, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      s.pack_id, s.shot_number, s.status, s.scene_json, s.image_prompt,
      s.video_prompt_cn, s.duration, s.face_drift_risk, s.created_at
    ).run();
  }
}

export async function saveAgentLogs(db: D1Database, packId: string, logs: any[]) {
  for (const l of logs) {
    await db.prepare(`
      INSERT INTO agent_logs (pack_id, agent, step, model, tokens_in, tokens_out,
        duration_ms, success, error_msg)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      packId, l.agent, l.step, l.model, l.tokens_in, l.tokens_out,
      l.duration_ms, l.success ? 1 : 0, l.error_msg || null
    ).run();
  }
}

export async function getPack(db: D1Database, packId: string) {
  return db.prepare('SELECT * FROM packs WHERE pack_id = ?').bind(packId).first();
}

export async function getShots(db: D1Database, packId: string) {
  return db.prepare('SELECT * FROM shots WHERE pack_id = ? ORDER BY shot_number').bind(packId).all();
}

export async function listPacks(db: D1Database, limit = 20) {
  return db.prepare('SELECT * FROM packs ORDER BY created_at DESC LIMIT ?').bind(limit).all();
}

export async function updateShotImage(
  db: D1Database,
  packId: string,
  shotNumber: number,
  imageUrl: string,
  qcStatus: string,
  qcScore: number,
  qcNotes: string
) {
  await db.prepare(`
    UPDATE shots SET
      first_frame_url = ?, status = ?, qc_status = ?, qc_score = ?, qc_notes = ?
    WHERE pack_id = ? AND shot_number = ?
  `).bind(
    imageUrl,
    qcStatus === 'pass' ? 'image_ready' : 'image_qc_fail',
    qcStatus, qcScore, qcNotes,
    packId, shotNumber
  ).run();
}

export async function updatePackStatus(db: D1Database, packId: string, status: string) {
  await db.prepare('UPDATE packs SET status = ? WHERE pack_id = ?').bind(status, packId).run();
}

export async function getShotsByStatus(db: D1Database, packId: string, status: string) {
  return db.prepare(
    'SELECT * FROM shots WHERE pack_id = ? AND status = ? ORDER BY shot_number'
  ).bind(packId, status).all();
}

export async function updateShotVideo(
  db: D1Database,
  packId: string,
  shotNumber: number,
  videoUrl: string,
  qcStatus: string,
  qcScore: number,
  qcNotes: string
) {
  await db.prepare(`
    UPDATE shots SET
      video_url = ?, status = ?, qc_status = ?, qc_score = ?, qc_notes = ?
    WHERE pack_id = ? AND shot_number = ?
  `).bind(
    videoUrl,
    qcStatus === 'pass' ? 'video_ready' : 'video_qc_fail',
    qcStatus, qcScore, qcNotes,
    packId, shotNumber
  ).run();
}

export async function deletePack(db: D1Database, packId: string) {
  await db.prepare('DELETE FROM agent_logs WHERE pack_id = ?').bind(packId).run();
  await db.prepare('DELETE FROM shots WHERE pack_id = ?').bind(packId).run();
  const pack = await db.prepare('SELECT idea_id FROM packs WHERE pack_id = ?').bind(packId).first<{ idea_id: string }>();
  await db.prepare('DELETE FROM packs WHERE pack_id = ?').bind(packId).run();
  if (pack?.idea_id) {
    const remaining = await db.prepare('SELECT 1 FROM packs WHERE idea_id = ? LIMIT 1').bind(pack.idea_id).first();
    if (!remaining) await db.prepare('DELETE FROM ideas WHERE idea_id = ?').bind(pack.idea_id).run();
  }
}

export async function updatePackPublish(
  db: D1Database,
  packId: string,
  meta: { caption: string; hashtags: string; hook: string; cover_text: string }
) {
  await db.prepare(`
    UPDATE packs SET caption = ?, hashtags = ?, hook = ?, cover_text = ?, status = 'publish_ready'
    WHERE pack_id = ?
  `).bind(meta.caption, meta.hashtags, meta.hook, meta.cover_text, packId).run();
}
