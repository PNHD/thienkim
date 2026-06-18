export function dashboardHTML(apiBase: string) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Thiên Kim — Content Pipeline</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0a0a0f;--card:#12121c;--card2:#181828;--border:#1e1e30;
  --accent:#d4a574;--accent2:#e8c9a0;--accent-dim:#d4a57440;
  --text:#e8e8f0;--muted:#888;--dim:#555;
  --green:#4ade80;--red:#f87171;--blue:#60a5fa;--purple:#a78bfa;--yellow:#fbbf24;
  --radius:14px;--radius-sm:10px;
}
body{font-family:'Inter','Segoe UI',system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;line-height:1.5}
a{color:var(--accent);text-decoration:none}
button{cursor:pointer;border:none;font-family:inherit;transition:.2s}
input,textarea,select{font-family:inherit}

/* Header */
.header{
  background:linear-gradient(135deg,#12122a 0%,#1a1a35 50%,#0f1525 100%);
  border-bottom:1px solid var(--border);padding:14px 24px;
  display:flex;align-items:center;gap:14px;position:sticky;top:0;z-index:100;
  backdrop-filter:blur(12px);
}
.header .logo{font-size:22px;font-weight:800;background:linear-gradient(135deg,var(--accent),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.header .tag{font-size:10px;background:var(--accent);color:#000;padding:2px 10px;border-radius:20px;font-weight:700;letter-spacing:.5px;text-transform:uppercase}
.header nav{margin-left:auto;display:flex;gap:4px}
.header nav button{background:none;color:var(--muted);font-size:13px;padding:8px 16px;border-radius:var(--radius-sm);font-weight:500}
.header nav button:hover{color:var(--text);background:#ffffff08}
.header nav button.active{color:var(--accent2);background:var(--accent-dim)}

.container{max-width:1100px;margin:0 auto;padding:28px 20px}

/* Form */
.form-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:28px;margin-bottom:24px;position:relative;overflow:hidden}
.form-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--accent),var(--purple),var(--accent))}
.form-card h2{font-size:18px;margin-bottom:20px;color:var(--accent2);font-weight:700}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.form-grid.full{grid-template-columns:1fr}
.form-group{display:flex;flex-direction:column;gap:6px}
.form-group label{font-size:11px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.5px}
input,textarea,select{
  width:100%;background:var(--card2);border:1px solid var(--border);color:var(--text);
  padding:11px 14px;border-radius:var(--radius-sm);font-size:14px;transition:.2s;
}
input:focus,textarea:focus,select:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-dim)}
textarea{resize:vertical;min-height:80px}
select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23888' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center}

.btn{padding:11px 22px;border-radius:var(--radius-sm);font-weight:600;font-size:14px;transition:.2s;display:inline-flex;align-items:center;gap:8px}
.btn-primary{background:linear-gradient(135deg,var(--accent),#c49060);color:#000}
.btn-primary:hover{filter:brightness(1.1);transform:translateY(-1px)}
.btn-secondary{background:var(--card2);color:var(--text);border:1px solid var(--border)}
.btn-secondary:hover{border-color:var(--accent);color:var(--accent)}
.btn-danger{background:#7f1d1d;color:var(--red);border:1px solid #991b1b}
.btn-danger:hover{background:#991b1b}
.btn-ghost{background:none;color:var(--accent);padding:8px 14px}
.btn-ghost:hover{background:var(--accent-dim)}
.btn-sm{padding:7px 14px;font-size:12px}
.btn-row{display:flex;gap:10px;margin-top:20px;flex-wrap:wrap}

/* Idea Generator */
.idea-box{background:var(--card2);border:1px dashed var(--accent-dim);border-radius:var(--radius-sm);padding:16px;margin-top:14px;display:none}
.idea-box.show{display:block;animation:fadeIn .3s}
.idea-box h4{font-size:13px;color:var(--accent);margin-bottom:8px;font-weight:600}
.idea-box p{font-size:13px;line-height:1.6;color:var(--text)}
.idea-box .idea-actions{margin-top:12px;display:flex;gap:8px}

/* Pack List */
.section-title{font-size:13px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-bottom:16px}
.pack-list{display:flex;flex-direction:column;gap:10px}
.pack-item{
  background:var(--card);border:1px solid var(--border);border-radius:var(--radius);
  padding:18px 22px;display:flex;align-items:center;gap:16px;cursor:pointer;transition:.2s;
}
.pack-item:hover{border-color:var(--accent);transform:translateY(-2px);box-shadow:0 8px 24px #00000040}
.pack-item .icon{width:42px;height:42px;border-radius:10px;background:var(--accent-dim);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
.pack-item .info{flex:1;min-width:0}
.pack-item .title{font-weight:600;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pack-item .meta{font-size:12px;color:var(--muted);display:flex;gap:10px;margin-top:4px;flex-wrap:wrap}
.pack-item .meta span{display:inline-flex;align-items:center;gap:4px}
.pack-item .actions{display:flex;gap:6px;align-items:center}
.status{font-size:10px;padding:4px 12px;border-radius:20px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap}
.s-draft{background:#333;color:#aaa}
.s-generating_images{background:#713f12;color:var(--yellow)}
.s-images_ready,.s-image_ready{background:#14532d;color:var(--green)}
.s-awaiting_video{background:#78350f;color:var(--yellow)}
.s-videos_ready,.s-video_ready{background:#1e3a5f;color:var(--blue)}
.s-publish_ready{background:#3b0764;color:var(--purple)}
.s-images_partial{background:#713f12;color:var(--yellow)}

/* Detail */
.detail-header{margin-bottom:24px}
.detail-header h2{font-size:24px;font-weight:800;background:linear-gradient(135deg,var(--accent2),var(--text));-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:10px}
.detail-header .info{display:flex;gap:10px;flex-wrap:wrap;font-size:12px;color:var(--muted)}
.detail-header .info span{background:var(--card2);padding:5px 12px;border-radius:20px;border:1px solid var(--border)}
.detail-actions{display:flex;gap:8px;margin:16px 0;flex-wrap:wrap}

.shots-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;margin-top:16px}
.shot-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;transition:.2s}
.shot-card:hover{border-color:var(--accent-dim)}
.shot-head{padding:12px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;background:var(--card2)}
.shot-head h3{font-size:13px;font-weight:700}
.shot-body{padding:16px;font-size:13px;line-height:1.6}
.prompt-label{font-size:10px;color:var(--accent);font-weight:700;margin-top:10px;text-transform:uppercase;letter-spacing:.5px}
.prompt-block{background:var(--card2);padding:10px 12px;border-radius:8px;margin:6px 0;font-size:12px;line-height:1.5;max-height:100px;overflow-y:auto;word-break:break-word;border:1px solid var(--border)}
.shot-card img{width:100%;aspect-ratio:9/16;object-fit:cover;background:#0a0a0f}
.shot-card video{width:100%;aspect-ratio:9/16;object-fit:cover;background:#0a0a0f}
.upload-area{padding:14px;border-top:1px solid var(--border);background:var(--card2)}
.upload-area label{font-size:10px;color:var(--accent);font-weight:600;text-transform:uppercase;letter-spacing:.5px}
.upload-area input{margin-top:6px;font-size:12px}

/* Publish Card */
.publish-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:22px;margin-top:20px}
.publish-card h3{font-size:15px;margin-bottom:14px;color:var(--accent2);font-weight:700}
.publish-field{margin-bottom:14px}
.publish-field label{font-size:10px;color:var(--accent);font-weight:700;text-transform:uppercase;letter-spacing:.5px}
.publish-field p{margin-top:4px;font-size:14px;line-height:1.6;white-space:pre-wrap}

/* Wizard Steps */
.wizard{margin-top:20px}
.wizard-steps{display:flex;gap:4px;margin-bottom:24px}
.wizard-step{flex:1;height:4px;border-radius:4px;background:var(--border)}
.wizard-step.done{background:var(--green)}
.wizard-step.active{background:var(--accent);animation:pulse 1.5s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
.wizard-card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:24px;position:relative;overflow:hidden}
.wizard-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--accent)}
.wizard-card h3{font-size:16px;font-weight:700;color:var(--accent2);margin-bottom:6px}
.wizard-card .step-label{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px}
.wizard-card pre{background:var(--card2);border:1px solid var(--border);border-radius:8px;padding:14px;font-size:12px;line-height:1.6;overflow-x:auto;white-space:pre-wrap;max-height:400px;overflow-y:auto}
.wizard-actions{margin-top:18px;display:flex;gap:10px}

/* Misc */
.loading{display:flex;align-items:center;gap:10px;color:var(--muted);font-size:14px;padding:60px;justify-content:center}
.spinner{width:22px;height:22px;border:2.5px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .6s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.toast{position:fixed;bottom:24px;right:24px;padding:14px 22px;border-radius:var(--radius-sm);font-size:14px;font-weight:600;z-index:200;animation:slideUp .3s;backdrop-filter:blur(8px)}
.toast.ok{background:#166534e0;color:var(--green);border:1px solid #16653480}
.toast.error{background:#7f1d1de0;color:var(--red);border:1px solid #991b1b80}
@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
.empty{text-align:center;padding:80px 20px;color:var(--muted)}
.empty p{margin-bottom:20px;font-size:15px}
.divider{height:1px;background:var(--border);margin:24px 0}
.confirm-overlay{position:fixed;inset:0;background:#00000080;z-index:300;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)}
.confirm-box{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:28px;max-width:400px;width:90%;text-align:center}
.confirm-box h3{margin-bottom:12px;font-size:16px;color:var(--red)}
.confirm-box p{color:var(--muted);font-size:14px;margin-bottom:20px}
.confirm-box .btn-row{justify-content:center}

@media(max-width:640px){
  .form-grid{grid-template-columns:1fr}
  .shots-grid{grid-template-columns:1fr}
  .header{flex-wrap:wrap;gap:8px}
  .header nav{margin-left:0;width:100%;justify-content:center}
  .container{padding:16px 12px}
}
</style>
</head>
<body>

<div class="header">
  <span class="logo">Thiên Kim</span>
  <span class="tag">Pipeline v2</span>
  <nav>
    <button onclick="showView('create')" id="nav-create">Tạo mới</button>
    <button onclick="showView('packs')" id="nav-packs" class="active">Tất cả Pack</button>
  </nav>
</div>

<div class="container" id="app"></div>

<script>
const API = '';
let currentView = 'packs';
let currentPack = null;
let wizardState = {};

async function api(path, opts) {
  const res = await fetch(API + path, {
    headers: {'Content-Type':'application/json'}, ...opts,
    body: opts?.body ? JSON.stringify(opts.body) : undefined
  });
  return res.json();
}

function toast(msg, isError) {
  const el = document.createElement('div');
  el.className = 'toast ' + (isError ? 'error' : 'ok');
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function showView(view, data) {
  currentView = view;
  document.querySelectorAll('.header nav button').forEach(b => b.classList.remove('active'));
  const navBtn = document.getElementById('nav-' + (view === 'detail' ? '' : view));
  if (navBtn) navBtn.classList.add('active');
  if (view === 'create') renderCreate();
  else if (view === 'packs') renderPacks();
  else if (view === 'detail') renderDetail(data);
}

// ── Create View ──
function renderCreate() {
  const app = document.getElementById('app');
  app.innerHTML = \`
    <div class="form-card">
      <h2>Tạo Pack OOTD Mới</h2>
      <div class="form-grid">
        <div class="form-group"><label>Phong cách (Niche)</label><input id="f-niche" placeholder="casual fashion, streetwear, elegance..."></div>
        <div class="form-group"><label>Tâm trạng (Mood)</label><input id="f-mood" placeholder="warm golden hour, cool night..."></div>
      </div>
      <div class="form-grid full" style="margin-top:14px">
        <div class="form-group">
          <label>Mô tả ý tưởng</label>
          <textarea id="f-notes" placeholder="Ví dụ: casual summer ootd, linen pants + crop top, rooftop cafe Saigon"></textarea>
        </div>
      </div>
      <div id="idea-box" class="idea-box">
        <h4>Ý tưởng được tạo bởi AI</h4>
        <p id="idea-text"></p>
        <div class="idea-actions">
          <button class="btn btn-primary btn-sm" onclick="applyIdea()">Dùng ý tưởng này</button>
          <button class="btn btn-secondary btn-sm" onclick="generateIdea()">Tạo lại</button>
          <button class="btn btn-ghost btn-sm" onclick="document.getElementById('idea-box').classList.remove('show')">Ẩn</button>
        </div>
      </div>
      <div class="form-grid" style="margin-top:14px">
        <div class="form-group"><label>Số cảnh (3–6)</label><input id="f-stages" type="number" value="4" min="3" max="6"></div>
        <div class="form-group"><label>Giày (tùy chỉnh)</label><input id="f-footwear" placeholder="Để trống = elegant beige flat sandals"></div>
      </div>
      <div class="form-grid" style="margin-top:14px">
        <div class="form-group"><label>Nền tảng</label><select id="f-platform"><option value="">Tự động</option><option value="tiktok">TikTok</option><option value="reels">Reels</option></select></div>
        <div class="form-group"><label>Quốc gia</label><input id="f-country" value="VN"></div>
      </div>
      <div class="btn-row">
        <button class="btn btn-secondary" onclick="generateIdea()">Tạo ý tưởng AI</button>
        <button class="btn btn-primary" onclick="startWizard()">Bắt đầu tạo Pack</button>
      </div>
    </div>
  \`;
}

let lastIdea = null;
async function generateIdea() {
  const niche = document.getElementById('f-niche')?.value || '';
  const mood = document.getElementById('f-mood')?.value || '';
  const country = document.getElementById('f-country')?.value || 'VN';
  const box = document.getElementById('idea-box');
  const txt = document.getElementById('idea-text');
  box.classList.add('show');
  txt.innerHTML = '<span style="color:var(--muted)">Đang suy nghĩ...</span>';
  try {
    const res = await api('/api/generate-idea', { method: 'POST', body: { niche, mood, country } });
    if (res.ok) {
      lastIdea = res.idea;
      txt.innerHTML = '<strong>' + esc(res.idea.title_vi) + '</strong><br><br>' + esc(res.idea.notes) + '<br><br><span style="color:var(--muted)">Niche: ' + esc(res.idea.niche) + ' · Mood: ' + esc(res.idea.mood) + '</span>';
    } else {
      txt.innerHTML = '<span style="color:var(--red)">Lỗi: ' + esc(res.error) + '</span>';
    }
  } catch(e) {
    txt.innerHTML = '<span style="color:var(--red)">Lỗi kết nối: ' + esc(e.message) + '</span>';
  }
}

function applyIdea() {
  if (!lastIdea) return;
  document.getElementById('f-notes').value = lastIdea.notes;
  document.getElementById('f-niche').value = lastIdea.niche;
  document.getElementById('f-mood').value = lastIdea.mood;
  toast('Đã áp dụng ý tưởng!');
}

function gatherForm() {
  return {
    notes: document.getElementById('f-notes')?.value || '',
    niche: document.getElementById('f-niche')?.value || '',
    mood: document.getElementById('f-mood')?.value || '',
    stage_count: parseInt(document.getElementById('f-stages')?.value) || 4,
    footwear_override: document.getElementById('f-footwear')?.value || '',
    platform: document.getElementById('f-platform')?.value || '',
    country: document.getElementById('f-country')?.value || 'VN',
  };
}

// ── Step-by-step Wizard ──
async function startWizard() {
  const brief = gatherForm();
  if (!brief.notes && !brief.niche) {
    return toast('Vui lòng nhập mô tả ý tưởng hoặc phong cách', true);
  }
  wizardState = { brief, step: 1 };
  renderWizardStep1();
}

function wizardStepsHTML(active) {
  return '<div class="wizard-steps">' + [1,2,3,4].map(n =>
    '<div class="wizard-step ' + (n < active ? 'done' : n === active ? 'active' : '') + '"></div>'
  ).join('') + '</div>';
}

async function renderWizardStep1() {
  const app = document.getElementById('app');
  app.innerHTML = wizardStepsHTML(1) + '<div class="wizard-card"><div class="step-label">Bước 1 / 4</div><h3>Quyết định sáng tạo</h3><div class="loading"><div class="spinner"></div>AI đang phân tích ý tưởng...</div></div>';
  try {
    const res = await api('/api/step/decide', { method: 'POST', body: wizardState.brief });
    if (!res.ok) throw new Error(res.error);
    wizardState.decision = res.decision;
    app.innerHTML = wizardStepsHTML(1) + \`<div class="wizard-card">
      <div class="step-label">Bước 1 / 4</div>
      <h3>Quyết định sáng tạo</h3>
      <pre>\${esc(JSON.stringify(res.decision, null, 2))}</pre>
      <div class="wizard-actions">
        <button class="btn btn-primary" onclick="renderWizardStep2()">Duyệt & Tiếp tục</button>
        <button class="btn btn-secondary" onclick="renderWizardStep1()">Tạo lại</button>
        <button class="btn btn-ghost" onclick="showView('create')">Hủy</button>
      </div>
    </div>\`;
  } catch(e) {
    app.innerHTML = wizardStepsHTML(1) + '<div class="wizard-card"><div class="step-label">Bước 1 / 4</div><h3>Lỗi</h3><p style="color:var(--red)">' + esc(e.message) + '</p><div class="wizard-actions"><button class="btn btn-secondary" onclick="renderWizardStep1()">Thử lại</button><button class="btn btn-ghost" onclick="showView(\\'create\\')">Quay lại</button></div></div>';
  }
}

async function renderWizardStep2() {
  const app = document.getElementById('app');
  app.innerHTML = wizardStepsHTML(2) + '<div class="wizard-card"><div class="step-label">Bước 2 / 4</div><h3>Storyboard</h3><div class="loading"><div class="spinner"></div>Đang tạo storyboard + kiểm duyệt...</div></div>';
  try {
    const res = await api('/api/step/storyboard', { method: 'POST', body: { ...wizardState.brief, decision: wizardState.decision } });
    if (!res.ok) throw new Error(res.error);
    wizardState.storyboard = res.storyboard;
    wizardState.qc = res.qc;
    const scenes = res.storyboard.scenes || [];
    let scenesHTML = scenes.map((s,i) => '<div style="background:var(--card2);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:8px"><strong>Cảnh ' + (i+1) + '</strong> · ' + esc(s.subject) + ' · ' + esc(s.duration) + ' · ' + esc(s.camera) + '<br><span style="color:var(--muted)">' + esc(s.description) + '</span></div>').join('');
    const qcBadge = res.qc.pass ? '<span style="color:var(--green)">QC: Đạt (' + res.qc.score + '/100)</span>' : '<span style="color:var(--yellow)">QC: ' + res.qc.score + '/100 — ' + (res.qc.issues||[]).join(', ') + '</span>';
    app.innerHTML = wizardStepsHTML(2) + \`<div class="wizard-card">
      <div class="step-label">Bước 2 / 4</div>
      <h3>Storyboard</h3>
      <p style="margin-bottom:12px">\${qcBadge}</p>
      \${scenesHTML}
      <div class="wizard-actions">
        <button class="btn btn-primary" onclick="renderWizardStep3()">Duyệt & Tiếp tục</button>
        <button class="btn btn-secondary" onclick="renderWizardStep2()">Tạo lại</button>
        <button class="btn btn-ghost" onclick="showView('create')">Hủy</button>
      </div>
    </div>\`;
  } catch(e) {
    app.innerHTML = wizardStepsHTML(2) + '<div class="wizard-card"><div class="step-label">Bước 2 / 4</div><h3>Lỗi</h3><p style="color:var(--red)">' + esc(e.message) + '</p><div class="wizard-actions"><button class="btn btn-secondary" onclick="renderWizardStep2()">Thử lại</button><button class="btn btn-ghost" onclick="showView(\\'create\\')">Quay lại</button></div></div>';
  }
}

async function renderWizardStep3() {
  const app = document.getElementById('app');
  app.innerHTML = wizardStepsHTML(3) + '<div class="wizard-card"><div class="step-label">Bước 3 / 4</div><h3>Prompt hình ảnh & video</h3><div class="loading"><div class="spinner"></div>Đang tạo prompt...</div></div>';
  try {
    const res = await api('/api/step/prompts', { method: 'POST', body: { ...wizardState.brief, storyboard: wizardState.storyboard } });
    if (!res.ok) throw new Error(res.error);
    wizardState.pack = res.pack;
    wizardState.shots = res.shots;
    let shotsHTML = res.shots.map((s,i) => \`<div style="background:var(--card2);border:1px solid var(--border);border-radius:8px;padding:14px;margin-bottom:8px">
      <strong>Shot \${s.shot_number}</strong> · \${esc(s.duration)} · Drift: \${s.face_drift_risk}
      <div class="prompt-label">Image Prompt</div>
      <div class="prompt-block">\${esc(s.image_prompt)}</div>
      <div class="prompt-label">Video Prompt (CN)</div>
      <div class="prompt-block">\${esc(s.video_prompt_cn)}</div>
    </div>\`).join('');
    app.innerHTML = wizardStepsHTML(3) + \`<div class="wizard-card">
      <div class="step-label">Bước 3 / 4</div>
      <h3>Prompt hình ảnh & video</h3>
      <p style="color:var(--muted);margin-bottom:12px">Pack: \${esc(res.pack.trend_title)}</p>
      \${shotsHTML}
      <div class="wizard-actions">
        <button class="btn btn-primary" onclick="renderWizardStep4()">Lưu Pack</button>
        <button class="btn btn-ghost" onclick="showView('create')">Hủy</button>
      </div>
    </div>\`;
  } catch(e) {
    app.innerHTML = wizardStepsHTML(3) + '<div class="wizard-card"><div class="step-label">Bước 3 / 4</div><h3>Lỗi</h3><p style="color:var(--red)">' + esc(e.message) + '</p><div class="wizard-actions"><button class="btn btn-secondary" onclick="renderWizardStep3()">Thử lại</button></div></div>';
  }
}

async function renderWizardStep4() {
  const app = document.getElementById('app');
  app.innerHTML = wizardStepsHTML(4) + '<div class="wizard-card"><div class="step-label">Bước 4 / 4</div><h3>Đang lưu...</h3><div class="loading"><div class="spinner"></div>Đang lưu vào cơ sở dữ liệu...</div></div>';
  try {
    const res = await api('/api/step/save', { method: 'POST', body: { pack: wizardState.pack, shots: wizardState.shots, logs: [] } });
    if (!res.ok) throw new Error(res.error);
    app.innerHTML = wizardStepsHTML(5) + \`<div class="wizard-card" style="text-align:center;padding:40px">
      <div style="font-size:48px;margin-bottom:16px">&#10024;</div>
      <h3>Tạo Pack thành công!</h3>
      <p style="color:var(--muted);margin:12px 0">ID: \${esc(res.pack_id)}</p>
      <div class="wizard-actions" style="justify-content:center">
        <button class="btn btn-primary" onclick="showView('detail','\${esc(res.pack_id)}')">Xem chi tiết</button>
        <button class="btn btn-secondary" onclick="showView('packs')">Tất cả Pack</button>
      </div>
    </div>\`;
  } catch(e) {
    app.innerHTML = wizardStepsHTML(4) + '<div class="wizard-card"><div class="step-label">Bước 4 / 4</div><h3>Lỗi lưu</h3><p style="color:var(--red)">' + esc(e.message) + '</p><div class="wizard-actions"><button class="btn btn-secondary" onclick="renderWizardStep4()">Thử lại</button></div></div>';
  }
}

// ── Pack List ──
async function renderPacks() {
  const app = document.getElementById('app');
  app.innerHTML = '<div class="loading"><div class="spinner"></div>Đang tải...</div>';
  try {
    const res = await api('/api/packs');
    const packs = res.packs || [];
    if (!packs.length) {
      app.innerHTML = '<div class="empty"><p>Chưa có pack nào.</p><button class="btn btn-primary" onclick="showView(\\'create\\')">Tạo pack đầu tiên</button></div>';
      return;
    }
    app.innerHTML = '<div class="section-title">Tất cả Pack (' + packs.length + ')</div><div class="pack-list">' + packs.map(p => \`
      <div class="pack-item">
        <div class="icon" onclick="showView('detail','\${p.pack_id}')">&#127916;</div>
        <div class="info" onclick="showView('detail','\${p.pack_id}')">
          <div class="title">\${esc(p.trend_title)}</div>
          <div class="meta">
            <span>\${p.content_type}</span>
            <span>\${p.expected_stage_count} cảnh</span>
            <span>\${timeAgo(p.created_at)}</span>
          </div>
        </div>
        <div class="actions">
          <span class="status s-\${p.status}">\${statusVi(p.status)}</span>
          <button class="btn btn-danger btn-sm" onclick="event.stopPropagation();confirmDelete('\${p.pack_id}','\${esc(p.trend_title).replace(/'/g,"\\\\'")}')">Xóa</button>
        </div>
      </div>
    \`).join('') + '</div>';
  } catch(e) {
    app.innerHTML = '<div class="empty"><p>Lỗi tải danh sách: ' + esc(e.message) + '</p></div>';
  }
}

function statusVi(s) {
  const map = {
    draft:'Bản nháp', generating_images:'Đang tạo ảnh', images_ready:'Ảnh sẵn sàng',
    images_partial:'Ảnh chưa đủ', awaiting_video:'Chờ video', videos_ready:'Video sẵn sàng',
    videos_partial:'Video chưa đủ', publish_ready:'Sẵn sàng đăng', image_error:'Lỗi ảnh',
  };
  return map[s] || s.replace(/_/g,' ');
}

// ── Delete Confirm ──
function confirmDelete(packId, title) {
  const overlay = document.createElement('div');
  overlay.className = 'confirm-overlay';
  overlay.innerHTML = \`<div class="confirm-box">
    <h3>Xóa Pack?</h3>
    <p>Bạn có chắc muốn xóa "<strong>\${title}</strong>"?<br>Hành động này không thể hoàn tác.</p>
    <div class="btn-row">
      <button class="btn btn-danger" onclick="doDelete('\${packId}',this.closest('.confirm-overlay'))">Xóa</button>
      <button class="btn btn-secondary" onclick="this.closest('.confirm-overlay').remove()">Hủy</button>
    </div>
  </div>\`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

async function doDelete(packId, overlay) {
  try {
    const res = await api('/api/packs/' + packId, { method: 'DELETE' });
    if (res.ok) {
      toast('Đã xóa pack thành công');
      overlay.remove();
      renderPacks();
    } else {
      toast(res.error, true);
    }
  } catch(e) { toast(e.message, true); }
}

// ── Pack Detail ──
async function renderDetail(packId) {
  currentPack = packId;
  const app = document.getElementById('app');
  app.innerHTML = '<div class="loading"><div class="spinner"></div>Đang tải pack...</div>';
  try {
    const res = await api('/api/packs/' + packId);
    if (!res.ok) { toast(res.error, true); return showView('packs'); }
    const pack = res.pack;
    const shots = res.shots || [];

    let html = \`
      <div class="detail-header">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" onclick="showView('packs')">&larr; Quay lại</button>
          <h2>\${esc(pack.trend_title)}</h2>
          <span class="status s-\${pack.status}">\${statusVi(pack.status)}</span>
        </div>
        <div class="info">
          <span>\${pack.pack_id}</span>
          <span>\${pack.content_type}</span>
          <span>\${pack.story_pattern}</span>
          <span>\${pack.editing_style}</span>
          <span>Điểm nhấn: \${esc(pack.visual_anchor || '')}</span>
        </div>
      </div>
      <div class="detail-actions">
        <button class="btn btn-primary btn-sm" onclick="runPublish('\${packId}')">Tạo Caption / Hashtags</button>
        <button class="btn btn-secondary btn-sm" onclick="uploadAllVideos('\${packId}')">Tải lên tất cả video</button>
        <button class="btn btn-danger btn-sm" onclick="confirmDelete('\${packId}','\${esc(pack.trend_title).replace(/'/g,"\\\\'")}')">Xóa pack</button>
      </div>
    \`;

    if (pack.caption) {
      html += \`<div class="publish-card">
        <h3>Thông tin đăng bài</h3>
        <div class="publish-field"><label>Hook</label><p>\${esc(pack.hook || '')}</p></div>
        <div class="publish-field"><label>Chữ bìa</label><p>\${esc(pack.cover_text || '')}</p></div>
        <div class="publish-field"><label>Caption</label><p>\${esc(pack.caption)}</p></div>
        <div class="publish-field"><label>Hashtags</label><p>\${esc(pack.hashtags || '')}</p></div>
      </div>\`;
    }

    html += '<div class="divider"></div><div class="section-title">Các cảnh quay (' + shots.length + ')</div>';
    html += '<div class="shots-grid">';
    for (const s of shots) {
      const scene = s.scene_json ? JSON.parse(s.scene_json) : {};
      html += \`<div class="shot-card">
        <div class="shot-head">
          <h3>Cảnh \${s.shot_number}</h3>
          <span class="status s-\${s.status}">\${statusVi(s.status)}</span>
        </div>
        \${s.first_frame_url && !s.first_frame_url.startsWith('data:') ? '<img src="' + s.first_frame_url + '" alt="Cảnh ' + s.shot_number + '">' : ''}
        \${s.video_url ? '<video src="' + s.video_url + '" controls></video>' : ''}
        <div class="shot-body">
          <div><strong>\${esc(scene.subject || '')}</strong> · \${s.duration} · \${esc(scene.camera || '')}</div>
          <p style="margin-top:6px;color:var(--muted)">\${esc(scene.description || '')}</p>
          <div class="prompt-label">Image Prompt</div>
          <div class="prompt-block">\${esc(s.image_prompt || '')}</div>
          <div class="prompt-label">Video Prompt (CN)</div>
          <div class="prompt-block">\${esc(s.video_prompt_cn || '')}</div>
        </div>
        <div class="upload-area">
          <label>Video URL (RunningHub)</label>
          <input id="vid-\${s.shot_number}" placeholder="https://..." value="\${s.video_url || ''}">
          <button class="btn btn-secondary btn-sm" style="margin-top:8px" onclick="uploadVideo('\${packId}',\${s.shot_number})">Tải lên Video</button>
        </div>
      </div>\`;
    }
    html += '</div>';
    app.innerHTML = html;
  } catch(e) {
    toast('Lỗi: ' + e.message, true);
    showView('packs');
  }
}

async function uploadVideo(packId, shotNum) {
  const url = document.getElementById('vid-' + shotNum)?.value?.trim();
  if (!url) return toast('Nhập video URL trước', true);
  try {
    const res = await api('/api/video/' + packId, { method: 'POST', body: { shots: [{ shot_number: shotNum, video_url: url }] } });
    if (res.ok) toast('Tải lên cảnh ' + shotNum + ' thành công');
    else toast(res.error, true);
    renderDetail(packId);
  } catch(e) { toast(e.message, true); }
}

async function uploadAllVideos(packId) {
  const inputs = document.querySelectorAll('[id^="vid-"]');
  const shots = [];
  inputs.forEach(inp => {
    const num = parseInt(inp.id.replace('vid-',''));
    if (inp.value.trim()) shots.push({ shot_number: num, video_url: inp.value.trim() });
  });
  if (!shots.length) return toast('Nhập ít nhất 1 video URL', true);
  try {
    const res = await api('/api/video/' + packId, { method: 'POST', body: { shots } });
    if (res.ok) toast('Tải lên ' + shots.length + ' video thành công');
    else toast(res.error, true);
    renderDetail(packId);
  } catch(e) { toast(e.message, true); }
}

async function runPublish(packId) {
  toast('Đang tạo caption...');
  try {
    const res = await api('/api/publish/' + packId, { method: 'POST' });
    if (res.ok) toast('Tạo thông tin đăng bài thành công!');
    else toast(res.error, true);
    renderDetail(packId);
  } catch(e) { toast(e.message, true); }
}

function esc(s) { if (!s) return ''; const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff/60000);
  if (m < 1) return 'vừa xong';
  if (m < 60) return m + ' phút trước';
  const h = Math.floor(m/60);
  if (h < 24) return h + ' giờ trước';
  const d = Math.floor(h/24);
  if (d < 30) return d + ' ngày trước';
  return Math.floor(d/30) + ' tháng trước';
}

showView('packs');
</script>
</body>
</html>`;
}
