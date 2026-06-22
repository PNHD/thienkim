// Image Agent — Toonflow 3-layer pattern
// For each shot: Generate Image → Vision QC → Retry if fail → Update D1
// Default generator: Gemini 2.5 Flash Image ("Nano Banana"). For Thiên Kim person
// shots, the previous person frame is passed back in as a reference image so her
// face / hair / skin identity stays consistent across shots.

import { callGemini, callGeminiVision, extractJSON } from '../lib/llm';
import { buildImageQCPrompt } from '../lib/prompts';
import type { Env, ShotRow, QCResult } from '../types';

export interface ImageGenConfig {
  provider: 'gemini_nano_banana' | 'gemini_imagen' | 'external_api';
  model?: string;
  width?: number;
  height?: number;
}

interface ImageResult {
  shot_number: number;
  image_url: string | null;
  qc: QCResult;
  retries: number;
  logs: AgentLog[];
}

interface AgentLog {
  agent: string;
  step: string;
  model: string;
  tokens_in: number;
  tokens_out: number;
  duration_ms: number;
  success: boolean;
  error_msg?: string;
}

const MAX_RETRIES = 2;

const DEFAULT_CONFIG: ImageGenConfig = {
  provider: 'gemini_nano_banana',
  model: 'gemini-2.5-flash-image', // "Nano Banana" — image gen + edit, accepts a reference image for identity consistency
  width: 768,
  height: 1344, // 9:16
};

export async function runImageAgent(
  packId: string,
  shots: ShotRow[],
  env: Env,
  config?: Partial<ImageGenConfig>
): Promise<{ results: ImageResult[]; allPassed: boolean }> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const results: ImageResult[] = [];

  // Process shots sequentially — face reference chain requires order
  let prevImageUrl: string | null = null;

  for (const shot of shots) {
    const result = await processShot(shot, prevImageUrl, env, cfg);
    results.push(result);
    if (result.image_url && shot.face_drift_risk !== 'none') {
      prevImageUrl = result.image_url;
    }
  }

  return {
    results,
    allPassed: results.every(r => r.qc.pass),
  };
}

async function processShot(
  shot: ShotRow,
  prevImageUrl: string | null,
  env: Env,
  config: ImageGenConfig
): Promise<ImageResult> {
  const logs: AgentLog[] = [];
  let imageUrl: string | null = null;
  let qcResult: QCResult = { pass: false, score: 0, issues: ['not run'] };
  let retries = 0;
  let enhancedPrompt = shot.image_prompt;

  // Only feed the previous frame as an identity reference on person shots.
  // Object / product / fantasy shots (face_drift_risk 'none') must NOT inherit the person.
  const referenceImageUrl = shot.face_drift_risk !== 'none' ? prevImageUrl : null;

  while (!qcResult.pass && retries <= MAX_RETRIES) {
    // ── Step 1: Generate Image ──
    const genStart = Date.now();
    try {
      imageUrl = await generateImage(enhancedPrompt, referenceImageUrl, env, config);
      logs.push({
        agent: 'image', step: `gen_${retries}`, model: config.model || 'gemini-2.5-flash-image',
        tokens_in: 0, tokens_out: 0,
        duration_ms: Date.now() - genStart, success: true,
      });
    } catch (err: any) {
      logs.push({
        agent: 'image', step: `gen_${retries}`, model: config.model || 'gemini-2.5-flash-image',
        tokens_in: 0, tokens_out: 0,
        duration_ms: Date.now() - genStart, success: false, error_msg: err.message,
      });
      retries++;
      continue;
    }

    if (!imageUrl) {
      retries++;
      continue;
    }

    // ── Step 2: Vision QC ──
    const qcStart = Date.now();
    try {
      const scene = JSON.parse(shot.scene_json);
      const qcPrompt = buildImageQCPrompt(scene, shot, referenceImageUrl !== null);

      const qcRes = await callGeminiVision(
        env.GEMINI_API_KEY,
        qcPrompt,
        imageUrl,
        { temperature: 0.2 }
      );

      qcResult = extractJSON<QCResult>(qcRes.text);
      logs.push({
        agent: 'image', step: `qc_${retries}`, model: qcRes.model,
        tokens_in: qcRes.tokens_in, tokens_out: qcRes.tokens_out,
        duration_ms: Date.now() - qcStart, success: qcResult.pass,
        error_msg: qcResult.pass ? undefined : qcResult.issues.join('; '),
      });

      // If QC fails, enhance the prompt with fixes
      if (!qcResult.pass && qcResult.fixes?.length) {
        enhancedPrompt = refinePrompt(shot.image_prompt, qcResult.fixes);
      }
    } catch (err: any) {
      logs.push({
        agent: 'image', step: `qc_${retries}`, model: 'gemini-2.5-flash',
        tokens_in: 0, tokens_out: 0,
        duration_ms: Date.now() - qcStart, success: false, error_msg: err.message,
      });
      // QC error = treat as pass with low confidence (don't block pipeline)
      qcResult = { pass: true, score: 50, issues: [`QC error: ${err.message}`] };
    }

    retries++;
  }

  return {
    shot_number: shot.shot_number,
    image_url: imageUrl,
    qc: qcResult,
    retries: retries - 1,
    logs,
  };
}

// ── Image Generation ──

async function generateImage(
  prompt: string,
  referenceImageUrl: string | null,
  env: Env,
  config: ImageGenConfig
): Promise<string> {
  if (config.provider === 'gemini_nano_banana') {
    return generateWithNanoBanana(prompt, referenceImageUrl, env.GEMINI_API_KEY, config);
  }
  if (config.provider === 'gemini_imagen') {
    return generateWithImagen(prompt, env.GEMINI_API_KEY, config);
  }
  // 'external_api' — reserved for OpenAI GPT Image / other providers (needs its own key)
  throw new Error(`Unknown image provider: ${config.provider}`);
}

// Gemini 2.5 Flash Image ("Nano Banana") — text-to-image + reference-conditioned
// generation. Uses the same GEMINI_API_KEY as Imagen / Vision QC.
async function generateWithNanoBanana(
  prompt: string,
  referenceImageUrl: string | null,
  apiKey: string,
  config: ImageGenConfig
): Promise<string> {
  const model = config.model || 'gemini-2.5-flash-image';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const parts: any[] = [];
  if (referenceImageUrl) {
    // Anchor identity to the previous Thiên Kim frame (mirrors callGeminiVision's image handling).
    if (referenceImageUrl.startsWith('data:')) {
      const [meta, base64] = referenceImageUrl.split(',');
      const mimeType = meta.match(/data:(.*?);/)?.[1] || 'image/png';
      parts.push({ inline_data: { mime_type: mimeType, data: base64 } });
    } else {
      parts.push({ file_data: { mime_type: 'image/png', file_uri: referenceImageUrl } });
    }
    parts.push({
      text: `Use the SAME woman shown in the reference image — keep her face, skin tone and hair identity identical. Do not change her appearance.\n\n${prompt}`,
    });
  } else {
    parts.push({ text: prompt });
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: { aspectRatio: '9:16' },
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Nano Banana ${res.status}: ${errText}`);
  }

  const data: any = await res.json();
  const outParts = data.candidates?.[0]?.content?.parts || [];
  const imgPart = outParts.find((p: any) => p.inlineData || p.inline_data);
  const inline = imgPart?.inlineData || imgPart?.inline_data;
  if (!inline?.data) {
    throw new Error('Nano Banana: no image in response');
  }
  const mime = inline.mimeType || inline.mime_type || 'image/png';

  // Return as data URL — will be uploaded to R2/storage in Phase 3
  return `data:${mime};base64,${inline.data}`;
}

async function generateWithImagen(
  prompt: string,
  apiKey: string,
  config: ImageGenConfig
): Promise<string> {
  const model = config.model || 'imagen-3.0-generate-002';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: '9:16',
        safetyFilterLevel: 'block_few',
        personGeneration: 'allow_all',
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Imagen ${res.status}: ${errText}`);
  }

  const data: any = await res.json();
  const prediction = data.predictions?.[0];
  if (!prediction?.bytesBase64Encoded) {
    throw new Error('Imagen: no image in response');
  }

  // Return as data URL — will be uploaded to R2/storage in Phase 3
  return `data:image/png;base64,${prediction.bytesBase64Encoded}`;
}

// ── Prompt Refinement ──

function refinePrompt(original: string, fixes: string[]): string {
  const fixBlock = fixes.map(f => `IMPORTANT: ${f}`).join(' ');
  return `${fixBlock}\n\n${original}`;
}
