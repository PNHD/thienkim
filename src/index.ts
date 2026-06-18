import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import { runScoutAgent, stepDecide, stepStoryboard, stepBuildPrompts } from './agents/scout';
import { dashboardHTML } from './ui';
import { runImageAgent } from './agents/image';
import { runPublishAgent } from './agents/publish';
import { savePack, saveShots, saveAgentLogs, getPack, getShots, listPacks, updateShotImage, updatePackStatus, getShotsByStatus, updateShotVideo, updatePackPublish, deletePack } from './db/queries';

type HonoEnv = { Bindings: Env };
const app = new Hono<HonoEnv>();

app.use('*', cors());

// Dashboard UI
app.get('/', (c) => {
  const url = new URL(c.req.url);
  return c.html(dashboardHTML(url.origin));
});

// Health check
app.get('/api/health', (c) => c.json({ service: 'tk-pipeline', version: '2.0.0', status: 'ok' }));

function parseBrief(body: any) {
  return {
    notes: body.notes || '',
    niche: body.niche || '',
    mood: body.mood || '',
    country: body.country || 'VN',
    platform: body.platform || '',
    stage_count: body.stage_count ? parseInt(body.stage_count, 10) : 4,
    footwear_override: body.footwear_override || '',
    duo_mode: body.duo_mode || false,
    thread_channel_id: body.thread_channel_id || '',
  };
}

// ── Step-by-step API (ToonFlow pattern) ──

// Step 1: Creative Decision — user reviews before proceeding
app.post('/api/step/decide', async (c) => {
  const body = await c.req.json();
  const brief = parseBrief(body);
  try {
    const { decision, log } = await stepDecide(brief, c.env);
    return c.json({ ok: true, decision, log: { step: log.step, model: log.model, duration_ms: log.duration_ms } });
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 500);
  }
});

// Step 2: Storyboard from approved decision — user reviews scenes
app.post('/api/step/storyboard', async (c) => {
  const body = await c.req.json();
  const brief = parseBrief(body);
  const decision = body.decision;
  if (!decision) return c.json({ ok: false, error: 'Missing decision object' }, 400);
  try {
    const { storyboard, qc, logs } = await stepStoryboard(decision, brief, c.env);
    return c.json({
      ok: true, storyboard, qc,
      logs: logs.map((l: any) => ({ step: l.step, model: l.model, duration_ms: l.duration_ms, success: l.success, error_msg: l.error_msg })),
    });
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 500);
  }
});

// Step 3: Build prompts from approved storyboard — user reviews prompts
app.post('/api/step/prompts', async (c) => {
  const body = await c.req.json();
  const brief = parseBrief(body);
  const storyboard = body.storyboard;
  if (!storyboard) return c.json({ ok: false, error: 'Missing storyboard object' }, 400);
  try {
    const { pack, shots } = stepBuildPrompts(storyboard, brief);
    return c.json({ ok: true, pack, shots });
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 500);
  }
});

// Step 4: Confirm & save to D1
app.post('/api/step/save', async (c) => {
  const body = await c.req.json();
  const { pack, shots, logs } = body;
  if (!pack || !shots) return c.json({ ok: false, error: 'Missing pack or shots' }, 400);
  try {
    await savePack(c.env.DB, pack);
    await saveShots(c.env.DB, shots);
    if (logs?.length) await saveAgentLogs(c.env.DB, pack.pack_id, logs);
    return c.json({ ok: true, pack_id: pack.pack_id });
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 500);
  }
});

// ── Scout Agent endpoint ──
app.post('/api/scout', async (c) => {
  const body = await c.req.json();
  const brief = {
    notes: body.notes || '',
    niche: body.niche || '',
    mood: body.mood || '',
    country: body.country || 'VN',
    platform: body.platform || '',
    stage_count: body.stage_count ? parseInt(body.stage_count, 10) : 4,
    footwear_override: body.footwear_override || '',
    duo_mode: body.duo_mode || false,
    thread_channel_id: body.thread_channel_id || '',
  };

  try {
    const result = await runScoutAgent(brief, c.env);

    // Save to D1
    await savePack(c.env.DB, result.pack);
    await saveShots(c.env.DB, result.shots);
    await saveAgentLogs(c.env.DB, result.pack.pack_id, result.logs);

    return c.json({
      ok: true,
      pack_id: result.pack.pack_id,
      trend_title: result.pack.trend_title,
      content_type: result.storyboard.content_type,
      story_pattern: result.storyboard.story_pattern,
      scene_count: result.storyboard.scenes.length,
      storyboard: result.storyboard,
      shots: result.shots.map(s => ({
        shot_number: s.shot_number,
        duration: s.duration,
        image_prompt: s.image_prompt.substring(0, 200) + '...',
        video_prompt_cn: s.video_prompt_cn,
        face_drift_risk: s.face_drift_risk,
      })),
      agent_logs: result.logs.map(l => ({
        step: l.step,
        model: l.model,
        duration_ms: l.duration_ms,
        success: l.success,
      })),
    });
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 500);
  }
});

// ── Read endpoints ──
app.get('/api/packs', async (c) => {
  const result = await listPacks(c.env.DB);
  return c.json({ ok: true, packs: result.results });
});

app.get('/api/packs/:packId', async (c) => {
  const packId = c.req.param('packId');
  const pack = await getPack(c.env.DB, packId);
  if (!pack) return c.json({ ok: false, error: 'Pack not found' }, 404);
  const shots = await getShots(c.env.DB, packId);
  return c.json({ ok: true, pack, shots: shots.results });
});

app.get('/api/packs/:packId/shots', async (c) => {
  const packId = c.req.param('packId');
  const shots = await getShots(c.env.DB, packId);
  return c.json({ ok: true, shots: shots.results });
});

// ── Image Agent endpoint ──
app.post('/api/image/:packId', async (c) => {
  const packId = c.req.param('packId');
  const pack = await getPack(c.env.DB, packId);
  if (!pack) return c.json({ ok: false, error: 'Pack not found' }, 404);

  const body = await c.req.json().catch(() => ({}));
  const shotsRes = body.shot_numbers
    ? await c.env.DB.prepare(
        `SELECT * FROM shots WHERE pack_id = ? AND shot_number IN (${(body.shot_numbers as number[]).map(() => '?').join(',')}) ORDER BY shot_number`
      ).bind(packId, ...body.shot_numbers).all()
    : await getShotsByStatus(c.env.DB, packId, 'prompt_ready');

  const shots = (shotsRes.results || []) as any[];
  if (!shots.length) return c.json({ ok: false, error: 'No shots ready for image generation' }, 400);

  try {
    await updatePackStatus(c.env.DB, packId, 'generating_images');

    const { results, allPassed } = await runImageAgent(packId, shots, c.env, body.config);

    // Save results to D1
    const allLogs: any[] = [];
    for (const r of results) {
      await updateShotImage(
        c.env.DB, packId, r.shot_number,
        r.image_url || '',
        r.qc.pass ? 'pass' : 'fail',
        r.qc.score,
        r.qc.issues.join('; ')
      );
      allLogs.push(...r.logs);
    }
    await saveAgentLogs(c.env.DB, packId, allLogs);
    await updatePackStatus(c.env.DB, packId, allPassed ? 'images_ready' : 'images_partial');

    return c.json({
      ok: true,
      pack_id: packId,
      all_passed: allPassed,
      results: results.map(r => ({
        shot_number: r.shot_number,
        has_image: !!r.image_url,
        qc_pass: r.qc.pass,
        qc_score: r.qc.score,
        qc_issues: r.qc.issues,
        retries: r.retries,
      })),
    });
  } catch (err: any) {
    await updatePackStatus(c.env.DB, packId, 'image_error');
    return c.json({ ok: false, error: err.message }, 500);
  }
});

// ── Manual Video Upload (RunningHub) ──
// POST body: { shots: [{ shot_number: 1, video_url: "https://..." }, ...] }
app.post('/api/video/:packId', async (c) => {
  const packId = c.req.param('packId');
  const pack = await getPack(c.env.DB, packId);
  if (!pack) return c.json({ ok: false, error: 'Pack not found' }, 404);

  const body = await c.req.json();
  const entries = body.shots as { shot_number: number; video_url: string }[];
  if (!entries?.length) return c.json({ ok: false, error: 'No shots provided. Send { shots: [{ shot_number, video_url }] }' }, 400);

  const results: { shot_number: number; ok: boolean }[] = [];
  for (const entry of entries) {
    await updateShotVideo(c.env.DB, packId, entry.shot_number, entry.video_url, 'pass', 100, 'manual upload');
    results.push({ shot_number: entry.shot_number, ok: true });
  }

  // Check if all shots now have video
  const allShots = (await getShots(c.env.DB, packId)).results as any[];
  const allHaveVideo = allShots.every((s: any) => s.video_url);
  await updatePackStatus(c.env.DB, packId, allHaveVideo ? 'videos_ready' : 'videos_partial');

  return c.json({ ok: true, pack_id: packId, updated: results, all_videos_ready: allHaveVideo });
});

// ── Publish Agent endpoint ──
app.post('/api/publish/:packId', async (c) => {
  const packId = c.req.param('packId');
  const pack = await getPack(c.env.DB, packId) as any;
  if (!pack) return c.json({ ok: false, error: 'Pack not found' }, 404);

  const shotsRes = await getShots(c.env.DB, packId);
  const shots = (shotsRes.results || []) as any[];

  try {
    const { meta, logs } = await runPublishAgent(pack, shots, c.env);

    await updatePackPublish(c.env.DB, packId, meta);
    await saveAgentLogs(c.env.DB, packId, logs);

    return c.json({
      ok: true,
      pack_id: packId,
      caption: meta.caption,
      hashtags: meta.hashtags,
      hook: meta.hook,
      cover_text: meta.cover_text,
    });
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 500);
  }
});

// ── Auto pipeline: Scout → Image → (pause for manual video) ──
// After this, user uploads videos via POST /api/video/:packId, then calls POST /api/publish/:packId
app.post('/api/pipeline', async (c) => {
  const body = await c.req.json();
  const brief = {
    notes: body.notes || '',
    niche: body.niche || '',
    mood: body.mood || '',
    country: body.country || 'VN',
    platform: body.platform || '',
    stage_count: body.stage_count ? parseInt(body.stage_count, 10) : 4,
    footwear_override: body.footwear_override || '',
    duo_mode: body.duo_mode || false,
    thread_channel_id: body.thread_channel_id || '',
  };

  const steps: string[] = [];
  try {
    // 1. Scout
    const scoutResult = await runScoutAgent(brief, c.env);
    await savePack(c.env.DB, scoutResult.pack);
    await saveShots(c.env.DB, scoutResult.shots);
    await saveAgentLogs(c.env.DB, scoutResult.pack.pack_id, scoutResult.logs);
    steps.push('scout');

    const packId = scoutResult.pack.pack_id;

    // 2. Image
    if (!body.skip_image) {
      await updatePackStatus(c.env.DB, packId, 'generating_images');
      const imgResult = await runImageAgent(packId, scoutResult.shots, c.env, body.image_config);
      for (const r of imgResult.results) {
        await updateShotImage(c.env.DB, packId, r.shot_number, r.image_url || '',
          r.qc.pass ? 'pass' : 'fail', r.qc.score, r.qc.issues.join('; '));
        await saveAgentLogs(c.env.DB, packId, r.logs);
      }
      await updatePackStatus(c.env.DB, packId, imgResult.allPassed ? 'images_ready' : 'images_partial');
      steps.push('image');
    }

    // Pipeline pauses here — video is manual via RunningHub
    await updatePackStatus(c.env.DB, packId, 'awaiting_video');

    const finalPack = await getPack(c.env.DB, packId);
    const finalShots = (await getShots(c.env.DB, packId)).results;

    return c.json({
      ok: true,
      pack_id: packId,
      steps_completed: steps,
      next_step: 'Upload videos via POST /api/video/' + packId + ' then call POST /api/publish/' + packId,
      pack: finalPack,
      shots: finalShots,
    });
  } catch (err: any) {
    return c.json({ ok: false, steps_completed: steps, error: err.message }, 500);
  }
});

// ── Delete Pack ──
app.delete('/api/packs/:packId', async (c) => {
  const packId = c.req.param('packId');
  const pack = await getPack(c.env.DB, packId);
  if (!pack) return c.json({ ok: false, error: 'Pack not found' }, 404);
  try {
    await deletePack(c.env.DB, packId);
    return c.json({ ok: true, deleted: packId });
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 500);
  }
});

// ── Generate Idea (DeepSeek) ──
app.post('/api/generate-idea', async (c) => {
  const body = await c.req.json();
  const { niche, mood, country } = body;
  try {
    const { callDeepSeek } = await import('./lib/llm');
    const res = await callDeepSeek(c.env.DEEPSEEK_API_KEY, [
      { role: 'user', content: `Bạn là creative director cho Thiên Kim — một nhà sáng tạo nội dung thời trang/lifestyle người Việt ở Sài Gòn.

Hãy đề xuất MỘT ý tưởng video OOTD/fashion ngắn (15-30 giây) cho TikTok/Reels.

Thông tin:
- Niche: ${niche || 'thời trang đường phố / casual'}
- Mood: ${mood || 'tự nhiên, thoải mái'}
- Thị trường: ${country || 'VN'}

Trả về JSON (không markdown):
{
  "notes": "mô tả ý tưởng chi tiết bằng tiếng Anh (2-3 câu, đủ cụ thể để tạo storyboard)",
  "niche": "niche ngắn gọn bằng tiếng Anh",
  "mood": "mood ngắn gọn bằng tiếng Anh",
  "title_vi": "tên ý tưởng ngắn bằng tiếng Việt có dấu"
}` },
    ], { temperature: 0.9 });
    const { extractJSON } = await import('./lib/llm');
    const idea = extractJSON<{ notes: string; niche: string; mood: string; title_vi: string }>(res.text);
    return c.json({ ok: true, idea });
  } catch (err: any) {
    return c.json({ ok: false, error: err.message }, 500);
  }
});

// ── Legacy n8n callback (backwards compat) ──
app.post('/api/n8n/callback', async (c) => {
  const secret = c.req.header('X-N8N-Secret');
  if (secret !== c.env.N8N_SECRET) return c.json({ error: 'unauthorized' }, 401);
  const body = await c.req.json();
  if (body.type === 'storyboard_complete' && body.pack_row && body.shot_rows) {
    await savePack(c.env.DB, body.pack_row);
    await saveShots(c.env.DB, body.shot_rows);
    return c.json({ ok: true, pack_id: body.pack_row.pack_id });
  }
  return c.json({ ok: false, error: 'unknown callback type' }, 400);
});

export default app;
