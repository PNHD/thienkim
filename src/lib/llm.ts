// Unified LLM client for DeepSeek + Gemini

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMResponse {
  text: string;
  tokens_in: number;
  tokens_out: number;
  model: string;
}

export async function callDeepSeek(
  apiKey: string,
  messages: ChatMessage[],
  opts?: { temperature?: number; maxTokens?: number }
): Promise<LLMResponse> {
  const model = 'deepseek-chat';
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages,
      temperature: opts?.temperature ?? 0.7,
      max_tokens: opts?.maxTokens ?? 4096,
    }),
  });
  if (!res.ok) throw new Error(`DeepSeek ${res.status}: ${await res.text()}`);
  const data: any = await res.json();
  const choice = data.choices?.[0];
  if (!choice) throw new Error('DeepSeek: no choices returned');
  return {
    text: choice.message.content,
    tokens_in: data.usage?.prompt_tokens ?? 0,
    tokens_out: data.usage?.completion_tokens ?? 0,
    model,
  };
}

export async function callGemini(
  apiKey: string,
  prompt: string,
  opts?: { temperature?: number; maxTokens?: number; model?: string }
): Promise<LLMResponse> {
  const model = opts?.model ?? 'gemini-3.1-flash-lite';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: opts?.temperature ?? 0.8,
        maxOutputTokens: opts?.maxTokens ?? 4096,
      },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data: any = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini: no text in response');
  return {
    text,
    tokens_in: data.usageMetadata?.promptTokenCount ?? 0,
    tokens_out: data.usageMetadata?.candidatesTokenCount ?? 0,
    model,
  };
}

export async function callGeminiVision(
  apiKey: string,
  prompt: string,
  imageUrl: string,
  opts?: { temperature?: number; model?: string }
): Promise<LLMResponse> {
  const model = opts?.model ?? 'gemini-2.5-flash-lite';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const parts: any[] = [{ text: prompt }];

  if (imageUrl.startsWith('data:')) {
    const [meta, base64] = imageUrl.split(',');
    const mimeType = meta.match(/data:(.*?);/)?.[1] || 'image/png';
    parts.push({ inline_data: { mime_type: mimeType, data: base64 } });
  } else {
    parts.push({ file_data: { mime_type: 'image/png', file_uri: imageUrl } });
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { temperature: opts?.temperature ?? 0.3, maxOutputTokens: 2048 },
    }),
  });
  if (!res.ok) throw new Error(`Gemini Vision ${res.status}: ${await res.text()}`);
  const data: any = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini Vision: no text in response');
  return {
    text,
    tokens_in: data.usageMetadata?.promptTokenCount ?? 0,
    tokens_out: data.usageMetadata?.candidatesTokenCount ?? 0,
    model,
  };
}

export function extractJSON<T>(raw: string): T {
  let cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first === -1 || last <= first) throw new Error('No JSON object found in LLM response');
  return JSON.parse(cleaned.substring(first, last + 1));
}
