// Publish Agent — Generate caption/hashtags/hook/cover text + update pack metadata
// DeepSeek reasoning → structured output → save to D1

import { callDeepSeek, extractJSON } from '../lib/llm';
import { buildPublishPrompt } from '../lib/prompts';
import type { Env, PackRow, ShotRow } from '../types';

interface PublishMeta {
  caption: string;
  hashtags: string;
  hook: string;
  cover_text: string;
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

export interface PublishResult {
  meta: PublishMeta;
  logs: AgentLog[];
}

export async function runPublishAgent(
  pack: PackRow,
  shots: ShotRow[],
  env: Env
): Promise<PublishResult> {
  const logs: AgentLog[] = [];
  const start = Date.now();

  const prompt = buildPublishPrompt(pack, shots);
  const res = await callDeepSeek(env.DEEPSEEK_API_KEY, [
    { role: 'user', content: prompt },
  ], { temperature: 0.7 });

  const meta = extractJSON<PublishMeta>(res.text);

  logs.push({
    agent: 'publish', step: 'generate_meta', model: res.model,
    tokens_in: res.tokens_in, tokens_out: res.tokens_out,
    duration_ms: Date.now() - start, success: true,
  });

  return { meta, logs };
}
