// Scout Agent — Toonflow 3-layer pattern
// Step 1: Decision (DeepSeek) — user reviews
// Step 2: Storyboard Gen (DeepSeek) + auto QC — user reviews
// Step 3: Prompt Builder (code) — user reviews prompts
// Step 4: Save to D1

import { callDeepSeek, extractJSON } from '../lib/llm';
import { buildDecisionPrompt, buildStoryboardPrompt, buildQCPrompt, TK_IDENTITY } from '../lib/prompts';
import type { Env, ScoutBrief, Storyboard, Scene, PackRow, ShotRow, QCResult } from '../types';

export interface AgentLog {
  agent: string;
  step: string;
  model: string;
  tokens_in: number;
  tokens_out: number;
  duration_ms: number;
  success: boolean;
  error_msg?: string;
}

export interface Decision {
  reasoning: string;
  content_type: string;
  story_pattern: string;
  visual_anchor: string;
  editing_style: string;
  thumbnail_scene: string;
}

// ── Step 1: Creative Decision ──
export async function stepDecide(brief: ScoutBrief, env: Env): Promise<{ decision: Decision; log: AgentLog }> {
  const stageCount = brief.stage_count || 4;
  const start = Date.now();
  const res = await callDeepSeek(env.DEEPSEEK_API_KEY, [
    { role: 'user', content: buildDecisionPrompt({ ...brief, stageCount }) },
  ], { temperature: 0.7 });

  const decision = extractJSON<Decision>(res.text);
  return {
    decision,
    log: {
      agent: 'scout', step: 'decision', model: res.model,
      tokens_in: res.tokens_in, tokens_out: res.tokens_out,
      duration_ms: Date.now() - start, success: true,
    },
  };
}

// ── Step 2: Storyboard Generation + QC ──
export async function stepStoryboard(
  decision: Decision,
  brief: ScoutBrief,
  env: Env
): Promise<{ storyboard: Storyboard; qc: QCResult; logs: AgentLog[] }> {
  const stageCount = brief.stage_count || 4;
  const logs: AgentLog[] = [];
  const MAX_RETRIES = 2;

  let storyboard: Storyboard | null = null;
  let qcResult: QCResult = { pass: false, score: 0, issues: ['not run'], fixes: [] };
  let retries = 0;
  let lastQCFixes = '';

  while (!qcResult.pass && retries <= MAX_RETRIES) {
    const sbStart = Date.now();
    const sbPrompt = buildStoryboardPrompt({
      ...decision,
      stageCount,
      notes: brief.notes + (lastQCFixes ? `\n\n## QC FIXES REQUIRED\n${lastQCFixes}` : ''),
      niche: brief.niche,
      mood: brief.mood,
    });

    const sbRes = await callDeepSeek(env.DEEPSEEK_API_KEY, [
      { role: 'user', content: sbPrompt },
    ], { temperature: retries === 0 ? 0.8 : 1.0 });
    const sbParsed = extractJSON<{ scenes: Scene[] }>(sbRes.text);

    storyboard = {
      content_type: decision.content_type as Storyboard['content_type'],
      story_pattern: decision.story_pattern,
      visual_anchor: decision.visual_anchor,
      editing_style: decision.editing_style,
      thumbnail_scene: decision.thumbnail_scene,
      scenes: sbParsed.scenes,
    };

    logs.push({
      agent: 'scout', step: `storyboard_gen_${retries}`, model: sbRes.model,
      tokens_in: sbRes.tokens_in, tokens_out: sbRes.tokens_out,
      duration_ms: Date.now() - sbStart, success: true,
    });

    const qcStart = Date.now();
    const qcRes = await callDeepSeek(env.DEEPSEEK_API_KEY, [
      { role: 'user', content: buildQCPrompt(storyboard, { ...brief, stage_count: stageCount }) },
    ], { temperature: 0.3 });

    qcResult = extractJSON<QCResult>(qcRes.text);
    logs.push({
      agent: 'scout', step: `qc_${retries}`, model: qcRes.model,
      tokens_in: qcRes.tokens_in, tokens_out: qcRes.tokens_out,
      duration_ms: Date.now() - qcStart, success: qcResult.pass,
      error_msg: qcResult.pass ? undefined : qcResult.issues.join('; '),
    });

    if (!qcResult.pass && qcResult.fixes?.length) {
      lastQCFixes = qcResult.fixes.join('\n');
    }
    retries++;
  }

  if (!storyboard) throw new Error('Storyboard generation failed after retries');
  return { storyboard, qc: qcResult, logs };
}

// ── Step 3: Build Prompts (deterministic) ──
export function stepBuildPrompts(
  storyboard: Storyboard,
  brief: ScoutBrief
): { pack: PackRow; shots: ShotRow[] } {
  return buildPrompts(storyboard, brief, {
    content_type: storyboard.content_type,
    story_pattern: storyboard.story_pattern,
    visual_anchor: storyboard.visual_anchor,
    editing_style: storyboard.editing_style,
    thumbnail_scene: storyboard.thumbnail_scene,
  });
}

// ── Legacy: run all steps at once ──
export async function runScoutAgent(brief: ScoutBrief, env: Env) {
  const { decision, log: decLog } = await stepDecide(brief, env);
  const { storyboard, logs: sbLogs } = await stepStoryboard(decision, brief, env);
  const { pack, shots } = stepBuildPrompts(storyboard, brief);
  return { pack, shots, storyboard, logs: [decLog, ...sbLogs] };
}

// ── Prompt Builder ──

function buildPrompts(
  sb: Storyboard,
  brief: ScoutBrief,
  decision: { content_type: string; story_pattern: string; visual_anchor: string; editing_style: string; thumbnail_scene: string }
) {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}`;
  const hex4 = Math.floor(Math.random() * 0x10000).toString(16).padStart(4, '0');
  const pack_id = `TK-${dateStr}-${timeStr}-${hex4}`;
  const idea_id = `${pack_id}-I01`;
  const iso = now.toISOString();

  const footwearEN = brief.footwear_override?.trim() || 'elegant beige flat sandals';
  const contentType = sb.content_type;
  const scenes = sb.scenes;

  const ROAMING = ['day_in_life', 'environment_first', 'contrast_edit', 'lifestyle_journey', 'emotion_arc', 'nature_immersion'];
  const isRoaming = ROAMING.includes(sb.story_pattern);
  const scene01Desc = scenes.find(s => s.scene_id === 'scene_01')?.description ?? '';

  let lastTkShot = 0;

  function lowerBodyVisible(cam: string) {
    return /full body|wide|medium full|full shot|waist.down|low.angle/i.test(cam);
  }

  function imagePrompt(scene: Scene, shotNum: number): string {
    const { subject, description: desc, camera: cam } = scene;
    if (subject === 'product') {
      return `Product photography, vertical 9:16. ${desc} Camera: ${cam}. High-end commercial product shot. Cinematic lighting. No people. No text, no watermark.`;
    }
    if (subject === 'fantasy') {
      return `Cinematic AI art, vertical 9:16. ${desc} Camera: ${cam}. Hyper-realistic digital art. Ethereal, dreamlike. Photorealistic. No text, no watermark.`;
    }
    if (subject === 'object_environment') {
      return `Vertical 9:16 cinematic photo. ${desc} Camera: ${cam}. Natural light. Candid aesthetic. No people visible. No text, no watermark.`;
    }
    if (subject === 'thien_kim_face') {
      const ref = lastTkShot === 0
        ? 'No prior reference — generate fresh identity.'
        : `Reference frame: Shot ${lastTkShot} — preserve face, skin, hair identity.`;
      return `${TK_IDENTITY} Scene: ${desc} Visual anchor: ${sb.visual_anchor}. Beauty editorial close-up. Soft luxury lighting. Face: slight 3/4 angle or front-facing. Soft dreamy expression. No strong head turn. Camera: ${cam}, vertical 9:16. ${ref} Photorealistic, 8K quality. No text, no watermark.`;
    }
    const bg = isRoaming
      ? `Location: ${desc}`
      : shotNum === 1
        ? `Establish background: ${desc}`
        : `Background: same location as Shot 1 — ${scene01Desc}`;
    const footwear = contentType === 'ootd_editorial' && lowerBodyVisible(cam)
      ? `Footwear: same ${footwearEN} throughout all shots. Do not change shoes.`
      : '';
    const ref = lastTkShot === 0
      ? 'No prior Thiên Kim reference — use base identity only. Generate fresh.'
      : `Reference frame: Shot ${lastTkShot} — preserve: face, hair, skin tone, outfit, visual anchor.`;
    const face = 'Face: front-facing or slight 3/4 angle. Soft natural expression. No profile, no strong head turn, no obstruction.';
    const realism = 'Natural daylight or warm ambient interior. Candid phone photo feel. No studio flash. No text, no watermark.';
    return [TK_IDENTITY, `Scene: ${desc}`, `Visual anchor: ${sb.visual_anchor}.`, bg, footwear, ref, face, `Camera: ${cam}, vertical 9:16.`, realism].filter(Boolean).join(' ');
  }

  function videoPromptCN(scene: Scene): string {
    const dur = scene.duration || '3s';
    const motion = scene.motion_prompt;
    if (scene.subject === 'product' || scene.subject === 'fantasy' || scene.subject === 'object_environment') {
      return `时长${dur}，静止镜头，固定机位，背景稳定，无文字无水印。场景动感：${motion}。`;
    }
    if (scene.subject === 'thien_kim_face') {
      return `时长${dur}，静止镜头，固定机位，人物外貌不变，面部稳定，无文字无水印。面部稳定，皮肤质感自然。动作意图：${motion}。`;
    }
    return `时长${dur}，静止镜头或静止镜头可极轻微缓慢推进，人物保持正脸或轻微三分之二正面，服装以参考图为准并保持一致，人物外貌不变，面部稳定，不转头不遮脸，背景稳定，无文字无水印。动作意图：${motion}。`;
  }

  const parts: string[] = [];
  if (brief.niche?.trim()) parts.push(brief.niche.trim());
  else if (brief.mood?.trim()) parts.push(brief.mood.trim());
  const styleWords: Record<string, string> = {
    slow_cinematic: 'Cinematic', dreamy: 'Dreamy', fast_trendy: 'Trendy', minimal_clean: 'Minimal',
    editorial: 'Editorial', warm_casual: 'Casual', luxury_slow: 'Luxury', fantasy_epic: 'Fantasy',
  };
  if (sb.editing_style) parts.push(styleWords[sb.editing_style] || sb.editing_style);
  const ctLabel: Record<string, string> = { ootd_editorial: 'OOTD', beauty_editorial: 'Beauty', brand_storytelling: 'Brand' };
  if (!parts.some(p => /ootd|beauty|brand/i.test(p))) {
    parts.push(ctLabel[contentType] || contentType);
  }
  if (!parts.length) parts.push(brief.notes || 'Untitled');
  const trend_title = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' · ');

  const shotRows: ShotRow[] = scenes.map((scene, i) => {
    const shotNum = i + 1;
    const isTK = scene.subject.startsWith('thien_kim');
    const ip = imagePrompt(scene, shotNum);
    const vp = videoPromptCN(scene);
    const driftRisk = scene.subject === 'thien_kim_face' ? 'medium' : isTK ? 'low' : 'none';
    if (isTK) lastTkShot = shotNum;
    return {
      pack_id, shot_number: shotNum, status: 'prompt_ready',
      scene_json: JSON.stringify(scene), image_prompt: ip, video_prompt_cn: vp,
      duration: scene.duration || '3s', face_drift_risk: driftRisk, created_at: iso,
    };
  });

  const pack: PackRow = {
    pack_id, idea_id, trend_title, status: 'draft',
    content_type: contentType, story_pattern: sb.story_pattern,
    visual_anchor: sb.visual_anchor, editing_style: sb.editing_style,
    thumbnail_scene: sb.thumbnail_scene, expected_stage_count: scenes.length,
    storyboard_json: JSON.stringify(sb),
    discord_thread_id: brief.thread_channel_id || '',
    notes: brief.notes, created_at: iso,
  };

  return { pack, shots: shotRows };
}
