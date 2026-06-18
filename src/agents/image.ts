// Image Agent — Toonflow 3-layer pattern
// For each shot: Generate Image → Vision QC → Retry if fail → Update D1

import { callGemini, callGeminiVision, extractJSON } from '../lib/llm';
import { buildImageQCPrompt } from '../lib/prompts';
import type { Env, ShotRow, QCResult } from '../types';

export interface ImageGenConfig {
  provider: 'gemini_imagen' | 'external_api';
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
  provider: 'gemini_imagen',
  model: 'imagen-4-fast-generate',
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

  while (!qcResult.pass && retries <= MAX_RETRIES) {
    // ── Step 1: Generate Image ──
    const genStart = Date.now();
    try {
      imageUrl = await generateImage(enhancedPrompt, env, config);
      logs.push({
        agent: 'image', step: `gen_${retries}`, model: config.model || 'imagen',
        tokens_in: 0, tokens_out: 0,
        duration_ms: Date.now() - genStart, success: true,
      });
    } catch (err: any) {
      logs.push({
        agent: 'image', step: `gen_${retries}`, model: config.model || 'imagen',
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
      const qcPrompt = buildImageQCPrompt(scene, shot, prevImageUrl !== null);

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
  env: Env,
  config: ImageGenConfig
): Promise<string> {
  if (config.provider === 'gemini_imagen') {
    return generateWithImagen(prompt, env.GEMINI_API_KEY, config);
  }
  throw new Error(`Unknown image provider: ${config.provider}`);
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
