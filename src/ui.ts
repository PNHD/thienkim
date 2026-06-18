export function dashboardHTML(apiBase: string) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Thiên Kim — Content Pipeline</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#09090b;--bg2:#0c0c10;--surface:#131318;--surface2:#1a1a22;--surface3:#222230;
  --border:#1f1f2e;--border2:#2a2a3a;
  --gold:#c9a55c;--gold2:#dbb978;--gold3:#f0d49a;--gold-dim:rgba(201,165,92,.12);--gold-dim2:rgba(201,165,92,.06);
  --text:#f0f0f5;--text2:#b0b0c0;--text3:#707088;--text4:#50506a;
  --green:#34d399;--green-bg:rgba(52,211,153,.1);
  --red:#f87171;--red-bg:rgba(248,113,113,.1);
  --blue:#60a5fa;--blue-bg:rgba(96,165,250,.1);
  --purple:#a78bfa;--purple-bg:rgba(167,139,250,.1);
  --yellow:#fbbf24;--yellow-bg:rgba(251,191,36,.1);
  --r:16px;--r2:12px;--r3:8px;
  --shadow:0 1px 3px rgba(0,0,0,.3),0 8px 24px rgba(0,0,0,.2);
  --shadow-lg:0 4px 12px rgba(0,0,0,.4),0 24px 48px rgba(0,0,0,.3);
}
html{height:100%}
body{font-family:'Inter',system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--text);min-height:100%;display:flex;line-height:1.55;font-size:14px;-webkit-font-smoothing:antialiased}
a{color:var(--gold);text-decoration:none}
button{cursor:pointer;border:none;font-family:inherit;transition:all .2s ease}
input,textarea,select{font-family:inherit}
::selection{background:var(--gold-dim);color:var(--gold3)}
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:var(--border2)}

/* ── Sidebar ── */
.sidebar{
  width:260px;min-height:100vh;background:var(--surface);border-right:1px solid var(--border);
  display:flex;flex-direction:column;position:fixed;left:0;top:0;bottom:0;z-index:100;
}
.sidebar-brand{padding:28px 24px 24px;border-bottom:1px solid var(--border)}
.sidebar-brand h1{font-size:24px;font-weight:800;letter-spacing:-.5px;background:linear-gradient(135deg,var(--gold2),var(--gold3));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.sidebar-brand p{font-size:11px;color:var(--text3);margin-top:4px;font-weight:500;letter-spacing:.5px;text-transform:uppercase}
.sidebar-nav{padding:16px 12px;flex:1;display:flex;flex-direction:column;gap:2px}
.nav-section{font-size:10px;font-weight:700;color:var(--text4);text-transform:uppercase;letter-spacing:1.2px;padding:16px 12px 8px}
.nav-item{
  display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:var(--r3);
  font-size:13px;font-weight:500;color:var(--text2);transition:all .15s;cursor:pointer;
}
.nav-item:hover{background:var(--gold-dim2);color:var(--text)}
.nav-item.active{background:var(--gold-dim);color:var(--gold2);font-weight:600}
.nav-item svg{width:18px;height:18px;opacity:.6;flex-shrink:0}
.nav-item.active svg{opacity:1}
.sidebar-footer{padding:16px 20px;border-top:1px solid var(--border);font-size:11px;color:var(--text4)}

/* ── Main ── */
.main{margin-left:260px;flex:1;min-height:100vh;display:flex;flex-direction:column}
.topbar{
  position:sticky;top:0;z-index:50;padding:16px 40px;
  background:rgba(9,9,11,.8);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
  border-bottom:1px solid var(--border);
  display:flex;align-items:center;gap:16px;
}
.topbar h2{font-size:18px;font-weight:700;flex:1}
.topbar .breadcrumb{font-size:12px;color:var(--text3);display:flex;align-items:center;gap:6px}
.topbar .breadcrumb span{color:var(--text2)}
.content{flex:1;padding:32px 40px 60px}

/* ── Buttons ── */
.btn{
  display:inline-flex;align-items:center;justify-content:center;gap:8px;
  padding:10px 20px;border-radius:var(--r3);font-weight:600;font-size:13px;
  transition:all .2s ease;white-space:nowrap;
}
.btn-primary{
  background:linear-gradient(135deg,var(--gold),#b8944e);color:#0a0a0b;
  box-shadow:0 1px 2px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.15);
}
.btn-primary:hover{filter:brightness(1.12);transform:translateY(-1px);box-shadow:0 4px 12px rgba(201,165,92,.3)}
.btn-secondary{background:var(--surface2);color:var(--text);border:1px solid var(--border)}
.btn-secondary:hover{border-color:var(--border2);background:var(--surface3)}
.btn-danger{background:var(--red-bg);color:var(--red);border:1px solid rgba(248,113,113,.2)}
.btn-danger:hover{background:rgba(248,113,113,.18);border-color:rgba(248,113,113,.4)}
.btn-ghost{background:none;color:var(--text2);padding:8px 14px}
.btn-ghost:hover{color:var(--text);background:var(--surface2)}
.btn-sm{padding:7px 14px;font-size:12px}
.btn-lg{padding:13px 28px;font-size:15px;border-radius:var(--r2)}
.btn-icon{width:36px;height:36px;padding:0;border-radius:var(--r3);display:flex;align-items:center;justify-content:center}

/* ── Cards ── */
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);overflow:hidden}
.card-glass{
  background:rgba(19,19,24,.6);border:1px solid var(--border);border-radius:var(--r);
  backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);overflow:hidden;
}
.card-highlight{position:relative}
.card-highlight::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent)}

/* ── Form Elements ── */
.form-group{display:flex;flex-direction:column;gap:6px}
.form-label{font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.8px}
.form-input{
  width:100%;background:var(--bg2);border:1px solid var(--border);color:var(--text);
  padding:12px 16px;border-radius:var(--r3);font-size:14px;transition:all .2s;
}
.form-input:focus{outline:none;border-color:var(--gold);box-shadow:0 0 0 3px var(--gold-dim)}
.form-input::placeholder{color:var(--text4)}
textarea.form-input{resize:vertical;min-height:88px;line-height:1.6}
select.form-input{
  appearance:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='%23707088'%3E%3Cpath d='M5 6L0 0h10z'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 14px center;padding-right:36px;
}

/* ── Grid helpers ── */
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.flex-row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.flex-col{display:flex;flex-direction:column}
.gap-sm{gap:8px}.gap-md{gap:16px}.gap-lg{gap:24px}.gap-xl{gap:32px}
.mt-sm{margin-top:8px}.mt-md{margin-top:16px}.mt-lg{margin-top:24px}.mt-xl{margin-top:32px}

/* ── Status Badge ── */
.badge{
  display:inline-flex;align-items:center;gap:6px;
  font-size:11px;font-weight:600;padding:4px 12px;border-radius:20px;
  letter-spacing:.3px;white-space:nowrap;
}
.badge::before{content:'';width:6px;height:6px;border-radius:50%;flex-shrink:0}
.badge-draft{background:var(--surface3);color:var(--text3)}.badge-draft::before{background:var(--text4)}
.badge-generating{background:var(--yellow-bg);color:var(--yellow)}.badge-generating::before{background:var(--yellow)}
.badge-images{background:var(--green-bg);color:var(--green)}.badge-images::before{background:var(--green)}
.badge-video{background:var(--blue-bg);color:var(--blue)}.badge-video::before{background:var(--blue)}
.badge-publish{background:var(--purple-bg);color:var(--purple)}.badge-publish::before{background:var(--purple)}
.badge-error{background:var(--red-bg);color:var(--red)}.badge-error::before{background:var(--red)}
.badge-waiting{background:var(--yellow-bg);color:var(--yellow)}.badge-waiting::before{background:var(--yellow);animation:blink 1.4s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}

/* ── Pack List ── */
.pack-table{display:flex;flex-direction:column;gap:1px;background:var(--border);border-radius:var(--r);overflow:hidden}
.pack-row{
  display:grid;grid-template-columns:1fr 140px 100px 120px 80px;align-items:center;
  gap:16px;padding:16px 24px;background:var(--surface);cursor:pointer;transition:all .15s;
}
.pack-row:hover{background:var(--surface2)}
.pack-row .pack-title{font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pack-row .pack-sub{font-size:12px;color:var(--text3);margin-top:2px}
.pack-row .pack-type{font-size:12px;color:var(--text2)}
.pack-row .pack-scenes{font-size:12px;color:var(--text3);text-align:center}
.pack-row .pack-time{font-size:12px;color:var(--text4)}
.pack-header{
  display:grid;grid-template-columns:1fr 140px 100px 120px 80px;
  gap:16px;padding:10px 24px;font-size:10px;font-weight:700;color:var(--text4);
  text-transform:uppercase;letter-spacing:1px;background:var(--surface);
}

/* ── Empty State ── */
.empty-state{
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:80px 40px;text-align:center;
}
.empty-state .icon-wrap{
  width:80px;height:80px;border-radius:20px;background:var(--gold-dim);
  display:flex;align-items:center;justify-content:center;font-size:36px;margin-bottom:24px;
}
.empty-state h3{font-size:20px;font-weight:700;margin-bottom:8px}
.empty-state p{color:var(--text3);font-size:14px;max-width:360px;margin-bottom:24px}

/* ── Create Form ── */
.create-layout{display:grid;grid-template-columns:1fr 340px;gap:24px;align-items:start}
.create-main{display:flex;flex-direction:column;gap:20px}
.create-sidebar-panel{position:sticky;top:100px}
.idea-panel{
  background:linear-gradient(135deg,rgba(201,165,92,.06),rgba(167,139,250,.04));
  border:1px solid var(--border);border-radius:var(--r);padding:24px;
}
.idea-panel h3{font-size:14px;font-weight:700;color:var(--gold2);margin-bottom:4px}
.idea-panel p.sub{font-size:12px;color:var(--text3);margin-bottom:16px}
.idea-result{margin-top:16px;padding:16px;background:var(--bg2);border-radius:var(--r3);border:1px solid var(--border)}
.idea-result h4{font-size:14px;font-weight:600;color:var(--text);margin-bottom:8px}
.idea-result p{font-size:13px;color:var(--text2);line-height:1.6}
.idea-result .meta{font-size:11px;color:var(--text4);margin-top:8px}

/* ── Wizard ── */
.wizard-progress{display:flex;align-items:center;gap:0;margin-bottom:32px;padding:0 4px}
.wiz-step{display:flex;align-items:center;gap:0;flex:1}
.wiz-dot{
  width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-size:12px;font-weight:700;border:2px solid var(--border);color:var(--text4);
  background:var(--surface);transition:all .3s;flex-shrink:0;position:relative;z-index:1;
}
.wiz-dot.done{background:var(--gold);border-color:var(--gold);color:#0a0a0b}
.wiz-dot.active{border-color:var(--gold);color:var(--gold);box-shadow:0 0 0 4px var(--gold-dim)}
.wiz-line{flex:1;height:2px;background:var(--border);margin:0 -1px}
.wiz-line.done{background:var(--gold)}
.wiz-labels{display:flex;margin-top:10px;padding:0 4px}
.wiz-label{flex:1;font-size:10px;font-weight:600;color:var(--text4);text-transform:uppercase;letter-spacing:.5px;text-align:center}
.wiz-label.active{color:var(--gold2)}
.wiz-label.done{color:var(--text2)}

.wizard-card{padding:32px}
.wizard-card h3{font-size:20px;font-weight:700;margin-bottom:8px}
.wizard-card .step-sub{font-size:13px;color:var(--text3);margin-bottom:24px}
.scene-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r2);padding:18px;transition:all .2s}
.scene-card:hover{border-color:var(--border2)}
.scene-card .scene-head{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.scene-card .scene-num{font-size:11px;font-weight:700;color:var(--gold);background:var(--gold-dim);padding:3px 10px;border-radius:4px}
.scene-card .scene-subject{font-size:12px;font-weight:600;color:var(--text2)}
.scene-card .scene-meta{font-size:11px;color:var(--text4)}
.scene-card .scene-desc{font-size:13px;color:var(--text2);margin-top:6px;line-height:1.5}

/* ── Detail View ── */
.detail-hero{
  padding:32px;background:linear-gradient(135deg,var(--surface),var(--surface2));
  border-bottom:1px solid var(--border);border-radius:var(--r) var(--r) 0 0;
}
.detail-hero h2{font-size:28px;font-weight:800;letter-spacing:-.5px;margin-bottom:12px}
.detail-meta{display:flex;gap:8px;flex-wrap:wrap}
.detail-meta .tag{font-size:11px;padding:5px 12px;border-radius:20px;background:var(--surface3);color:var(--text3);font-weight:500}
.detail-body{padding:32px}

.shots-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px}
.shot-card{border-radius:var(--r);overflow:hidden;transition:all .2s}
.shot-card:hover{transform:translateY(-2px);box-shadow:var(--shadow-lg)}
.shot-head{padding:14px 18px;background:var(--surface2);display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border)}
.shot-head h4{font-size:13px;font-weight:700}
.shot-body{padding:18px;font-size:13px}
.shot-body .desc{color:var(--text2);line-height:1.5;margin-bottom:12px}
.prompt-label{font-size:10px;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:.8px;margin-top:14px;margin-bottom:6px}
.prompt-block{
  background:var(--bg2);border:1px solid var(--border);padding:12px;border-radius:var(--r3);
  font-size:12px;line-height:1.55;max-height:100px;overflow-y:auto;color:var(--text2);word-break:break-word;
}
.shot-card img,.shot-card video{width:100%;aspect-ratio:9/16;object-fit:cover;background:var(--bg)}
.upload-area{padding:16px 18px;background:var(--surface2);border-top:1px solid var(--border)}
.upload-area .form-label{margin-bottom:6px}
.upload-area .form-input{font-size:12px;padding:9px 12px}

.publish-section{margin-top:24px}
.publish-section h3{font-size:16px;font-weight:700;margin-bottom:16px;color:var(--gold2)}
.publish-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.publish-item{padding:18px;border-radius:var(--r2)}
.publish-item label{font-size:10px;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:.8px}
.publish-item p{margin-top:6px;font-size:14px;line-height:1.6;white-space:pre-wrap}
.publish-item.full{grid-column:1/-1}

/* ── Loading ── */
.loading{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:80px;color:var(--text3)}
.loader{width:28px;height:28px;border:3px solid var(--border);border-top-color:var(--gold);border-radius:50%;animation:spin .7s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.loading p{font-size:14px;font-weight:500}

/* ── Toast ── */
.toast{
  position:fixed;bottom:28px;right:28px;padding:14px 24px;border-radius:var(--r2);
  font-size:13px;font-weight:600;z-index:300;backdrop-filter:blur(12px);
  animation:slideUp .3s ease;box-shadow:var(--shadow);
}
.toast.ok{background:rgba(52,211,153,.12);color:var(--green);border:1px solid rgba(52,211,153,.2)}
.toast.error{background:rgba(248,113,113,.12);color:var(--red);border:1px solid rgba(248,113,113,.2)}
@keyframes slideUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}

/* ── Confirm Dialog ── */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:400;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)}
.modal-box{
  background:var(--surface);border:1px solid var(--border);border-radius:var(--r);
  padding:32px;max-width:420px;width:90%;box-shadow:var(--shadow-lg);
}
.modal-box h3{font-size:18px;font-weight:700;margin-bottom:8px}
.modal-box p{color:var(--text3);font-size:14px;line-height:1.6;margin-bottom:24px}

/* ── Responsive ── */
@media(max-width:900px){
  .sidebar{display:none}
  .main{margin-left:0}
  .content{padding:20px 16px}
  .topbar{padding:14px 16px}
  .create-layout{grid-template-columns:1fr}
  .grid-2{grid-template-columns:1fr}
  .shots-grid{grid-template-columns:1fr}
  .pack-row{grid-template-columns:1fr auto}
  .pack-header{display:none}
  .pack-row .pack-type,.pack-row .pack-scenes,.pack-row .pack-time{display:none}
  .publish-grid{grid-template-columns:1fr}
}
</style>
</head>
<body>

<!-- Sidebar -->
<aside class="sidebar">
  <div class="sidebar-brand">
    <h1>Thiên Kim</h1>
    <p>Content Pipeline</p>
  </div>
  <nav class="sidebar-nav">
    <div class="nav-section">Chính</div>
    <div class="nav-item active" id="nav-packs" onclick="showView('packs')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
      Tất cả Pack
    </div>
    <div class="nav-item" id="nav-create" onclick="showView('create')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
      Tạo Pack mới
    </div>
    <div class="nav-section">Công cụ</div>
    <div class="nav-item" onclick="showView('create');setTimeout(generateIdea,100)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
      Tạo ý tưởng AI
    </div>
  </nav>
  <div class="sidebar-footer">
    Thiên Kim Pipeline v2.1
  </div>
</aside>

<!-- Main Content -->
<div class="main">
  <div class="topbar" id="topbar">
    <h2 id="page-title">Tất cả Pack</h2>
  </div>
  <div class="content" id="app"></div>
</div>

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

function setTitle(t, breadcrumb) {
  const tb = document.getElementById('topbar');
  if (breadcrumb) {
    tb.innerHTML = '<div class="breadcrumb"><span style="cursor:pointer" onclick="showView(\\'packs\\')">Tất cả Pack</span> <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg> <span style="color:var(--text)">' + esc(breadcrumb) + '</span></div>';
  } else {
    tb.innerHTML = '<h2>' + esc(t) + '</h2>';
  }
}

function showView(view, data) {
  currentView = view;
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  const navBtn = document.getElementById('nav-' + (view === 'detail' ? 'packs' : view));
  if (navBtn) navBtn.classList.add('active');
  if (view === 'create') { setTitle('Tạo Pack mới'); renderCreate(); }
  else if (view === 'packs') { setTitle('Tất cả Pack'); renderPacks(); }
  else if (view === 'detail') renderDetail(data);
}

// ── SVG Icons ──
const ICO = {
  sparkle: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.07-7.07l-2.83 2.83M9.76 14.24l-2.83 2.83m11.14 0l-2.83-2.83M9.76 9.76L6.93 6.93"/></svg>',
  trash: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>',
  play: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
};

// ── Create View ──
function renderCreate() {
  document.getElementById('app').innerHTML = \`
    <div class="create-layout">
      <div class="create-main">
        <div class="card card-highlight" style="padding:28px">
          <div class="flex-col gap-lg">
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Phong cách (Niche)</label>
                <input class="form-input" id="f-niche" placeholder="casual fashion, streetwear, elegance...">
              </div>
              <div class="form-group">
                <label class="form-label">Tâm trạng (Mood)</label>
                <input class="form-input" id="f-mood" placeholder="warm golden hour, cool night...">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Mô tả ý tưởng</label>
              <textarea class="form-input" id="f-notes" placeholder="Ví dụ: casual summer ootd, linen pants + crop top, rooftop cafe Saigon"></textarea>
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Số cảnh (3–6)</label>
                <input class="form-input" id="f-stages" type="number" value="4" min="3" max="6">
              </div>
              <div class="form-group">
                <label class="form-label">Giày (tùy chỉnh)</label>
                <input class="form-input" id="f-footwear" placeholder="Để trống = elegant beige flat sandals">
              </div>
            </div>
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Nền tảng</label>
                <select class="form-input" id="f-platform"><option value="">Tự động</option><option value="tiktok">TikTok</option><option value="reels">Reels</option></select>
              </div>
              <div class="form-group">
                <label class="form-label">Quốc gia</label>
                <input class="form-input" id="f-country" value="VN">
              </div>
            </div>
            <div class="flex-row" style="margin-top:8px">
              <button class="btn btn-primary btn-lg" onclick="startWizard()">\${ICO.play} Bắt đầu tạo Pack</button>
            </div>
          </div>
        </div>
      </div>

      <div class="create-sidebar-panel">
        <div class="idea-panel">
          <h3>\${ICO.sparkle} Trợ lý AI</h3>
          <p class="sub">Để AI gợi ý ý tưởng dựa trên niche và mood của bạn.</p>
          <button class="btn btn-secondary" onclick="generateIdea()" id="idea-btn" style="width:100%">\${ICO.sparkle} Tạo ý tưởng</button>
          <div id="idea-result" style="display:none"></div>
        </div>
      </div>
    </div>
  \`;
}

let lastIdea = null;
async function generateIdea() {
  const niche = document.getElementById('f-niche')?.value || '';
  const mood = document.getElementById('f-mood')?.value || '';
  const country = document.getElementById('f-country')?.value || 'VN';
  const box = document.getElementById('idea-result');
  const btn = document.getElementById('idea-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Đang suy nghĩ...'; }
  box.style.display = 'block';
  box.innerHTML = '<div style="text-align:center;padding:16px;color:var(--text4)"><div class="loader" style="margin:0 auto 12px"></div>AI đang tạo ý tưởng...</div>';
  try {
    const res = await api('/api/generate-idea', { method: 'POST', body: { niche, mood, country } });
    if (res.ok) {
      lastIdea = res.idea;
      box.innerHTML = '<div class="idea-result"><h4>' + esc(res.idea.title_vi) + '</h4><p>' + esc(res.idea.notes) + '</p><div class="meta">Niche: ' + esc(res.idea.niche) + ' · Mood: ' + esc(res.idea.mood) + '</div></div><div class="flex-row mt-sm"><button class="btn btn-primary btn-sm" onclick="applyIdea()">Dùng ý tưởng này</button><button class="btn btn-ghost btn-sm" onclick="generateIdea()">Tạo lại</button></div>';
    } else {
      box.innerHTML = '<div class="idea-result" style="border-color:rgba(248,113,113,.2)"><p style="color:var(--red)">Lỗi: ' + esc(res.error) + '</p></div>';
    }
  } catch(e) {
    box.innerHTML = '<div class="idea-result" style="border-color:rgba(248,113,113,.2)"><p style="color:var(--red)">' + esc(e.message) + '</p></div>';
  }
  if (btn) { btn.disabled = false; btn.innerHTML = ICO.sparkle + ' Tạo ý tưởng'; }
}

function applyIdea() {
  if (!lastIdea) return;
  const n = document.getElementById('f-notes'); if (n) n.value = lastIdea.notes;
  const ni = document.getElementById('f-niche'); if (ni) ni.value = lastIdea.niche;
  const m = document.getElementById('f-mood'); if (m) m.value = lastIdea.mood;
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

// ── Wizard ──
const STEPS = ['Quyết định', 'Storyboard', 'Prompts', 'Lưu'];

function wizardHTML(active) {
  let h = '<div class="wizard-progress">';
  for (let i = 0; i < 4; i++) {
    const cls = i < active - 1 ? 'done' : i === active - 1 ? 'active' : '';
    h += '<div class="wiz-step"><div class="wiz-dot ' + cls + '">' + (i < active - 1 ? '&#10003;' : (i + 1)) + '</div>';
    if (i < 3) h += '<div class="wiz-line ' + (i < active - 1 ? 'done' : '') + '"></div>';
    h += '</div>';
  }
  h += '</div><div class="wiz-labels">';
  for (let i = 0; i < 4; i++) {
    const cls = i < active - 1 ? 'done' : i === active - 1 ? 'active' : '';
    h += '<div class="wiz-label ' + cls + '">' + STEPS[i] + '</div>';
  }
  h += '</div>';
  return h;
}

async function startWizard() {
  const brief = gatherForm();
  if (!brief.notes && !brief.niche) return toast('Vui lòng nhập mô tả hoặc phong cách', true);
  wizardState = { brief, step: 1 };
  setTitle('Tạo Pack mới');
  renderWizardStep1();
}

async function renderWizardStep1() {
  const app = document.getElementById('app');
  app.innerHTML = wizardHTML(1) + '<div class="card card-highlight wizard-card"><h3>Quyết định sáng tạo</h3><p class="step-sub">AI phân tích brief và đưa ra quyết định về loại nội dung, pattern, và phong cách.</p><div class="loading"><div class="loader"></div><p>Đang phân tích...</p></div></div>';
  try {
    const res = await api('/api/step/decide', { method: 'POST', body: wizardState.brief });
    if (!res.ok) throw new Error(res.error);
    wizardState.decision = res.decision;
    const d = res.decision;
    app.innerHTML = wizardHTML(1) + \`<div class="card card-highlight wizard-card">
      <h3>Quyết định sáng tạo</h3>
      <p class="step-sub">Xem lại và duyệt quyết định trước khi tiếp tục.</p>
      <div class="grid-2 gap-md">
        <div class="scene-card"><div class="form-label" style="margin-bottom:6px">Loại nội dung</div><div style="font-size:15px;font-weight:600">\${esc(d.content_type)}</div></div>
        <div class="scene-card"><div class="form-label" style="margin-bottom:6px">Story Pattern</div><div style="font-size:15px;font-weight:600">\${esc(d.story_pattern)}</div></div>
        <div class="scene-card"><div class="form-label" style="margin-bottom:6px">Visual Anchor</div><div style="font-size:15px;font-weight:600">\${esc(d.visual_anchor)}</div></div>
        <div class="scene-card"><div class="form-label" style="margin-bottom:6px">Editing Style</div><div style="font-size:15px;font-weight:600">\${esc(d.editing_style)}</div></div>
      </div>
      <div class="scene-card mt-md"><div class="form-label" style="margin-bottom:6px">Phân tích</div><p style="font-size:13px;color:var(--text2);line-height:1.6">\${esc(d.reasoning)}</p></div>
      <div class="flex-row mt-lg">
        <button class="btn btn-primary" onclick="renderWizardStep2()">Duyệt & tiếp tục</button>
        <button class="btn btn-secondary" onclick="renderWizardStep1()">Tạo lại</button>
        <button class="btn btn-ghost" onclick="showView('create')">Hủy</button>
      </div>
    </div>\`;
  } catch(e) {
    app.innerHTML = wizardHTML(1) + '<div class="card card-highlight wizard-card"><h3>Lỗi</h3><p style="color:var(--red);margin:16px 0">' + esc(e.message) + '</p><div class="flex-row"><button class="btn btn-secondary" onclick="renderWizardStep1()">Thử lại</button><button class="btn btn-ghost" onclick="showView(\\'create\\')">Quay lại</button></div></div>';
  }
}

async function renderWizardStep2() {
  const app = document.getElementById('app');
  app.innerHTML = wizardHTML(2) + '<div class="card card-highlight wizard-card"><h3>Storyboard</h3><p class="step-sub">Đang tạo kịch bản chi tiết cho từng cảnh...</p><div class="loading"><div class="loader"></div><p>Đang tạo storyboard + kiểm duyệt chất lượng...</p></div></div>';
  try {
    const res = await api('/api/step/storyboard', { method: 'POST', body: { ...wizardState.brief, decision: wizardState.decision } });
    if (!res.ok) throw new Error(res.error);
    wizardState.storyboard = res.storyboard;
    const scenes = res.storyboard.scenes || [];
    const qcBadge = res.qc.pass
      ? '<span class="badge badge-images">QC Đạt · ' + res.qc.score + '/100</span>'
      : '<span class="badge badge-waiting">QC: ' + res.qc.score + '/100</span>';
    let scenesHTML = scenes.map((s,i) => \`<div class="scene-card">
      <div class="scene-head">
        <span class="scene-num">Cảnh \${i+1}</span>
        <span class="scene-subject">\${esc(s.subject)}</span>
        <span class="scene-meta">\${esc(s.duration)} · \${esc(s.camera)}</span>
      </div>
      <div class="scene-desc">\${esc(s.description)}</div>
    </div>\`).join('');
    app.innerHTML = wizardHTML(2) + \`<div class="card card-highlight wizard-card">
      <div class="flex-row" style="margin-bottom:16px"><h3 style="flex:1">Storyboard</h3>\${qcBadge}</div>
      <p class="step-sub">\${scenes.length} cảnh · Xem lại kịch bản trước khi tạo prompts.</p>
      <div class="flex-col gap-md">\${scenesHTML}</div>
      <div class="flex-row mt-lg">
        <button class="btn btn-primary" onclick="renderWizardStep3()">Duyệt & tiếp tục</button>
        <button class="btn btn-secondary" onclick="renderWizardStep2()">Tạo lại</button>
        <button class="btn btn-ghost" onclick="showView('create')">Hủy</button>
      </div>
    </div>\`;
  } catch(e) {
    app.innerHTML = wizardHTML(2) + '<div class="card card-highlight wizard-card"><h3>Lỗi</h3><p style="color:var(--red);margin:16px 0">' + esc(e.message) + '</p><div class="flex-row"><button class="btn btn-secondary" onclick="renderWizardStep2()">Thử lại</button><button class="btn btn-ghost" onclick="showView(\\'create\\')">Quay lại</button></div></div>';
  }
}

async function renderWizardStep3() {
  const app = document.getElementById('app');
  app.innerHTML = wizardHTML(3) + '<div class="card card-highlight wizard-card"><h3>Image & Video Prompts</h3><p class="step-sub">Đang xây dựng prompts cho từng cảnh...</p><div class="loading"><div class="loader"></div><p>Đang tạo prompts...</p></div></div>';
  try {
    const res = await api('/api/step/prompts', { method: 'POST', body: { ...wizardState.brief, storyboard: wizardState.storyboard } });
    if (!res.ok) throw new Error(res.error);
    wizardState.pack = res.pack;
    wizardState.shots = res.shots;
    let shotsHTML = res.shots.map(s => \`<div class="scene-card">
      <div class="scene-head"><span class="scene-num">Shot \${s.shot_number}</span><span class="scene-meta">\${esc(s.duration)} · Drift: \${s.face_drift_risk}</span></div>
      <div class="prompt-label">Image Prompt</div>
      <div class="prompt-block">\${esc(s.image_prompt)}</div>
      <div class="prompt-label">Video Prompt (CN)</div>
      <div class="prompt-block">\${esc(s.video_prompt_cn)}</div>
    </div>\`).join('');
    app.innerHTML = wizardHTML(3) + \`<div class="card card-highlight wizard-card">
      <h3>Image & Video Prompts</h3>
      <p class="step-sub">Pack: <strong>\${esc(res.pack.trend_title)}</strong> · Xem lại prompts trước khi lưu.</p>
      <div class="flex-col gap-md">\${shotsHTML}</div>
      <div class="flex-row mt-lg">
        <button class="btn btn-primary btn-lg" onclick="renderWizardStep4()">Lưu Pack</button>
        <button class="btn btn-ghost" onclick="showView('create')">Hủy</button>
      </div>
    </div>\`;
  } catch(e) {
    app.innerHTML = wizardHTML(3) + '<div class="card card-highlight wizard-card"><h3>Lỗi</h3><p style="color:var(--red);margin:16px 0">' + esc(e.message) + '</p><div class="flex-row"><button class="btn btn-secondary" onclick="renderWizardStep3()">Thử lại</button></div></div>';
  }
}

async function renderWizardStep4() {
  const app = document.getElementById('app');
  app.innerHTML = wizardHTML(4) + '<div class="card card-highlight wizard-card"><h3>Đang lưu...</h3><div class="loading"><div class="loader"></div><p>Đang lưu vào cơ sở dữ liệu...</p></div></div>';
  try {
    const res = await api('/api/step/save', { method: 'POST', body: { pack: wizardState.pack, shots: wizardState.shots, logs: [] } });
    if (!res.ok) throw new Error(res.error);
    app.innerHTML = wizardHTML(5) + \`<div class="card card-highlight" style="padding:60px;text-align:center">
      <div style="font-size:56px;margin-bottom:20px">&#10024;</div>
      <h3 style="font-size:24px;font-weight:800;margin-bottom:8px">Tạo Pack thành công!</h3>
      <p style="color:var(--text3);margin-bottom:28px">ID: \${esc(res.pack_id)}</p>
      <div class="flex-row" style="justify-content:center">
        <button class="btn btn-primary btn-lg" onclick="showView('detail','\${esc(res.pack_id)}')">Xem chi tiết</button>
        <button class="btn btn-secondary" onclick="showView('packs')">Tất cả Pack</button>
      </div>
    </div>\`;
  } catch(e) {
    app.innerHTML = wizardHTML(4) + '<div class="card card-highlight wizard-card"><h3>Lỗi lưu</h3><p style="color:var(--red);margin:16px 0">' + esc(e.message) + '</p><div class="flex-row"><button class="btn btn-secondary" onclick="renderWizardStep4()">Thử lại</button></div></div>';
  }
}

// ── Pack List ──
async function renderPacks() {
  const app = document.getElementById('app');
  app.innerHTML = '<div class="loading"><div class="loader"></div><p>Đang tải...</p></div>';
  try {
    const res = await api('/api/packs');
    const packs = res.packs || [];
    if (!packs.length) {
      app.innerHTML = \`<div class="empty-state">
        <div class="icon-wrap">&#127916;</div>
        <h3>Chưa có pack nào</h3>
        <p>Bắt đầu tạo pack đầu tiên — AI sẽ giúp bạn lên ý tưởng, storyboard, và prompts.</p>
        <button class="btn btn-primary btn-lg" onclick="showView('create')">\${ICO.sparkle} Tạo pack đầu tiên</button>
      </div>\`;
      return;
    }
    let html = '<div class="pack-table"><div class="pack-header"><span>Tên pack</span><span>Loại</span><span style="text-align:center">Cảnh</span><span>Thời gian</span><span></span></div>';
    for (const p of packs) {
      html += \`<div class="pack-row" onclick="showView('detail','\${p.pack_id}')">
        <div><div class="pack-title">\${esc(p.trend_title)}</div><div class="pack-sub">\${p.pack_id}</div></div>
        <div class="pack-type">\${badgeHTML(p.status)}</div>
        <div class="pack-scenes">\${p.expected_stage_count} cảnh</div>
        <div class="pack-time">\${timeAgo(p.created_at)}</div>
        <div style="text-align:right"><button class="btn btn-icon btn-danger" onclick="event.stopPropagation();confirmDelete('\${p.pack_id}','\${esc(p.trend_title).replace(/'/g,"\\\\\\'")}')" title="Xóa">\${ICO.trash}</button></div>
      </div>\`;
    }
    html += '</div>';
    app.innerHTML = html;
  } catch(e) {
    app.innerHTML = '<div class="empty-state"><h3>Lỗi tải danh sách</h3><p>' + esc(e.message) + '</p></div>';
  }
}

function badgeHTML(s) {
  const map = {
    draft: ['badge-draft','Nháp'], generating_images: ['badge-generating','Đang tạo ảnh'],
    images_ready: ['badge-images','Ảnh OK'], images_partial: ['badge-waiting','Ảnh chưa đủ'],
    awaiting_video: ['badge-waiting','Chờ video'], videos_ready: ['badge-video','Video OK'],
    videos_partial: ['badge-waiting','Video chưa đủ'], publish_ready: ['badge-publish','Sẵn sàng đăng'],
    image_error: ['badge-error','Lỗi ảnh'],
  };
  const [cls, label] = map[s] || ['badge-draft', s.replace(/_/g,' ')];
  return '<span class="badge ' + cls + '">' + label + '</span>';
}

// ── Delete ──
function confirmDelete(packId, title) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = \`<div class="modal-box">
    <h3>Xóa Pack?</h3>
    <p>Bạn có chắc muốn xóa "<strong>\${title}</strong>"? Toàn bộ dữ liệu (shots, logs) sẽ bị xóa vĩnh viễn.</p>
    <div class="flex-row">
      <button class="btn btn-danger" onclick="doDelete('\${packId}',this.closest('.modal-overlay'))">Xóa vĩnh viễn</button>
      <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Hủy</button>
    </div>
  </div>\`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
}

async function doDelete(packId, overlay) {
  try {
    const res = await api('/api/packs/' + packId, { method: 'DELETE' });
    if (res.ok) { toast('Đã xóa pack'); overlay.remove(); if (currentView === 'packs') renderPacks(); else showView('packs'); }
    else toast(res.error, true);
  } catch(e) { toast(e.message, true); }
}

// ── Detail ──
async function renderDetail(packId) {
  currentPack = packId;
  const app = document.getElementById('app');
  app.innerHTML = '<div class="loading"><div class="loader"></div><p>Đang tải...</p></div>';
  try {
    const res = await api('/api/packs/' + packId);
    if (!res.ok) { toast(res.error, true); return showView('packs'); }
    const pack = res.pack;
    const shots = res.shots || [];
    setTitle('', pack.trend_title);

    let html = '<div class="card" style="margin-bottom:24px"><div class="detail-hero">';
    html += '<div class="flex-row" style="margin-bottom:16px">' + badgeHTML(pack.status) + '</div>';
    html += '<h2>' + esc(pack.trend_title) + '</h2>';
    html += '<div class="detail-meta"><span class="tag">' + pack.pack_id + '</span><span class="tag">' + esc(pack.content_type) + '</span><span class="tag">' + esc(pack.story_pattern) + '</span><span class="tag">' + esc(pack.editing_style) + '</span><span class="tag">Anchor: ' + esc(pack.visual_anchor || '') + '</span></div>';
    html += '</div><div class="detail-body">';
    html += '<div class="flex-row">';
    html += '<button class="btn btn-primary btn-sm" onclick="runPublish(\\'' + packId + '\\')">' + ICO.sparkle + ' Tạo Caption</button>';
    html += '<button class="btn btn-secondary btn-sm" onclick="uploadAllVideos(\\'' + packId + '\\')">Tải lên tất cả video</button>';
    html += '<button class="btn btn-danger btn-sm" onclick="confirmDelete(\\'' + packId + '\\',\\'' + esc(pack.trend_title).replace(/'/g,"\\\\'") + '\\')">' + ICO.trash + ' Xóa pack</button>';
    html += '</div>';

    if (pack.caption) {
      html += '<div class="publish-section"><h3>Thông tin đăng bài</h3><div class="publish-grid">';
      html += '<div class="publish-item card"><label>Hook</label><p>' + esc(pack.hook || '') + '</p></div>';
      html += '<div class="publish-item card"><label>Chữ bìa</label><p>' + esc(pack.cover_text || '') + '</p></div>';
      html += '<div class="publish-item card full"><label>Caption</label><p>' + esc(pack.caption) + '</p></div>';
      html += '<div class="publish-item card full"><label>Hashtags</label><p style="color:var(--blue)">' + esc(pack.hashtags || '') + '</p></div>';
      html += '</div></div>';
    }

    html += '<div style="margin-top:28px"><div class="form-label" style="margin-bottom:16px;font-size:12px">Các cảnh quay (' + shots.length + ')</div>';
    html += '<div class="shots-grid">';
    for (const s of shots) {
      const scene = s.scene_json ? JSON.parse(s.scene_json) : {};
      html += '<div class="card shot-card">';
      html += '<div class="shot-head"><h4>Cảnh ' + s.shot_number + '</h4>' + badgeHTML(s.status) + '</div>';
      if (s.first_frame_url && !s.first_frame_url.startsWith('data:')) html += '<img src="' + s.first_frame_url + '" alt="Cảnh ' + s.shot_number + '">';
      if (s.video_url) html += '<video src="' + s.video_url + '" controls></video>';
      html += '<div class="shot-body"><div class="desc"><strong>' + esc(scene.subject || '') + '</strong> · ' + s.duration + ' · ' + esc(scene.camera || '') + '</div>';
      html += '<p class="desc">' + esc(scene.description || '') + '</p>';
      html += '<div class="prompt-label">Image Prompt</div><div class="prompt-block">' + esc(s.image_prompt || '') + '</div>';
      html += '<div class="prompt-label">Video Prompt (CN)</div><div class="prompt-block">' + esc(s.video_prompt_cn || '') + '</div>';
      html += '</div>';
      html += '<div class="upload-area"><div class="form-label">Video URL</div><input class="form-input" id="vid-' + s.shot_number + '" placeholder="https://..." value="' + (s.video_url || '') + '"><button class="btn btn-secondary btn-sm mt-sm" onclick="uploadVideo(\\'' + packId + '\\',' + s.shot_number + ')">Tải lên</button></div>';
      html += '</div>';
    }
    html += '</div></div>';
    html += '</div></div>';
    app.innerHTML = html;
  } catch(e) { toast('Lỗi: ' + e.message, true); showView('packs'); }
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
  inputs.forEach(inp => { const num = parseInt(inp.id.replace('vid-','')); if (inp.value.trim()) shots.push({ shot_number: num, video_url: inp.value.trim() }); });
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
