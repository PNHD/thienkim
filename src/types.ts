export interface Env {
  DB: D1Database;
  DEEPSEEK_API_KEY: string;
  GEMINI_API_KEY: string;
  N8N_SECRET?: string;
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
}

export interface ScoutBrief {
  notes: string;
  niche?: string;
  mood?: string;
  country?: string;
  platform?: string;
  stage_count?: number;
  footwear_override?: string;
  duo_mode?: boolean;
  thread_channel_id?: string;
}

export interface Scene {
  scene_id: string;
  subject: 'thien_kim' | 'thien_kim_face' | 'object_environment' | 'product' | 'fantasy';
  duration: string;
  description: string;
  motion_prompt: string;
  camera: string;
  transition_out: string;
}

export interface Storyboard {
  content_type: 'ootd_editorial' | 'beauty_editorial' | 'brand_storytelling';
  story_pattern: string;
  visual_anchor: string;
  editing_style: string;
  thumbnail_scene: string;
  product_description?: string;
  scenes: Scene[];
}

export interface PackRow {
  pack_id: string;
  idea_id: string;
  trend_title: string;
  status: string;
  content_type: string;
  story_pattern: string;
  visual_anchor: string;
  editing_style: string;
  thumbnail_scene: string;
  expected_stage_count: number;
  storyboard_json: string;
  discord_thread_id: string;
  notes: string;
  created_at: string;
}

export interface ShotRow {
  pack_id: string;
  shot_number: number;
  status: string;
  scene_json: string;
  image_prompt: string;
  video_prompt_cn: string;
  duration: string;
  first_frame_url?: string;
  video_url?: string;
  qc_status?: string;
  qc_score?: number;
  qc_notes?: string;
  face_drift_risk: string;
  created_at: string;
}

export interface QCResult {
  pass: boolean;
  score: number;
  issues: string[];
  fixes?: string[];
}
