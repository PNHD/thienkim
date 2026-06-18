export function dashboardHTML(apiBase: string) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Thiên Kim OOTD Pipeline</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#0a0a0f;--card:#14141f;--border:#222;--accent:#d4a574;--accent2:#e8c9a0;--text:#e0e0e0;--muted:#777;--green:#4ade80;--red:#f87171;--blue:#60a5fa}
body{font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh}
a{color:var(--accent);text-decoration:none}
button{cursor:pointer;border:none;font-family:inherit}

.header{background:linear-gradient(135deg,#1a1a2e,#16213e);border-bottom:1px solid var(--border);padding:16px 24px;display:flex;align-items:center;gap:16px;position:sticky;top:0;z-index:100}
.header h1{font-size:20px;font-weight:700;color:var(--accent2)}
.header .tag{font-size:11px;background:var(--accent);color:#000;padding:2px 8px;border-radius:10px;font-weight:600}
.header nav{margin-left:auto;display:flex;gap:12px}
.header nav button{background:none;color:var(--muted);font-size:13px;padding:6px 12px;border-radius:6px;transition:.2s}
.header nav button:hover,.header nav button.active{color:var(--text);background:#ffffff10}

.container{max-width:1100px;margin:0 auto;padding:24px}

/* Create Form */
.form-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:24px;margin-bottom:24px}
.form-card h2{font-size:16px;margin-bottom:16px;color:var(--accent2)}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.form-grid.full{grid-template-columns:1fr}
label{font-size:12px;color:var(--muted);margin-bottom:4px;display:block}
input,textarea,select{width:100%;background:#1a1a2a;border:1px solid var(--border);color:var(--text);padding:10px 12px;border-radius:8px;font-size:14px;font-family:inherit}
input:focus,textarea:focus{outline:none;border-color:var(--accent)}
textarea{resize:vertical;min-height:70px}
.btn{padding:10px 20px;border-radius:8px;font-weight:600;font-size:14px;transition:.2s}
.btn-primary{background:var(--accent);color:#000}
.btn-primary:hover{background:var(--accent2)}
.btn-secondary{background:#333;color:var(--text)}
.btn-secondary:hover{background:#444}
.btn-sm{padding:6px 12px;font-size:12px}
.btn-row{display:flex;gap:8px;margin-top:16px}

/* Pack List */
.pack-list{display:flex;flex-direction:column;gap:12px}
.pack-item{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px 20px;display:flex;align-items:center;gap:16px;cursor:pointer;transition:.2s}
.pack-item:hover{border-color:var(--accent);transform:translateY(-1px)}
.pack-item .title{font-weight:600;font-size:15px;flex:1}
.pack-item .meta{font-size:12px;color:var(--muted);display:flex;gap:12px}
.status{font-size:11px;padding:3px 10px;border-radius:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px}
.status-draft{background:#333;color:#aaa}
.status-images_ready,.status-image_ready{background:#166534;color:var(--green)}
.status-awaiting_video{background:#92400e;color:#fbbf24}
.status-videos_ready,.status-video_ready{background:#1e40af;color:var(--blue)}
.status-publish_ready{background:#7c3aed;color:#c4b5fd}
.status-generating_images{background:#854d0e;color:#fde68a}

/* Pack Detail */
.detail-header{margin-bottom:24px}
.detail-header h2{font-size:22px;font-weight:700;color:var(--accent2);margin-bottom:8px}
.detail-header .info{display:flex;gap:16px;flex-wrap:wrap;font-size:13px;color:var(--muted)}
.detail-header .info span{background:#1a1a2a;padding:4px 10px;border-radius:6px}

.shots-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-top:16px}
.shot-card{background:var(--card);border:1px solid var(--border);border-radius:12px;overflow:hidden}
.shot-card .shot-head{padding:12px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.shot-card .shot-head h3{font-size:14px;font-weight:600}
.shot-card .shot-body{padding:16px;font-size:13px;line-height:1.6}
.shot-card .prompt-block{background:#1a1a2a;padding:10px;border-radius:6px;margin:8px 0;font-size:12px;line-height:1.5;max-height:120px;overflow-y:auto;word-break:break-word}
.shot-card .prompt-label{font-size:11px;color:var(--accent);font-weight:600;margin-top:8px}
.shot-card img{width:100%;aspect-ratio:9/16;object-fit:cover;background:#111}
.shot-card video{width:100%;aspect-ratio:9/16;object-fit:cover;background:#111}
.shot-card .upload-area{padding:16px;border-top:1px solid var(--border)}
.shot-card .upload-area input{font-size:12px;margin-bottom:8px}

/* Publish */
.publish-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px;margin-top:16px}
.publish-card h3{font-size:15px;margin-bottom:12px;color:var(--accent2)}
.publish-field{margin-bottom:12px}
.publish-field label{font-size:11px;color:var(--accent);font-weight:600}
.publish-field p{margin-top:4px;font-size:14px;line-height:1.6;white-space:pre-wrap}

/* Loading */
.loading{display:flex;align-items:center;gap:8px;color:var(--muted);font-size:14px;padding:40px;justify-content:center}
.spinner{width:20px;height:20px;border:2px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin .6s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.toast{position:fixed;bottom:24px;right:24px;background:var(--green);color:#000;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:600;z-index:200;animation:slideUp .3s}
.toast.error{background:var(--red)}
@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}

.empty{text-align:center;padding:60px;color:var(--muted)}
.empty p{margin-bottom:16px}

@media(max-width:640px){
  .form-grid{grid-template-columns:1fr}
  .shots-grid{grid-template-columns:1fr}
  .header{flex-wrap:wrap}
  .header nav{margin-left:0;width:100%}
}
</style>
</head>
<body>

<div class="header">
  <h1>Thien Kim</h1>
  <span class="tag">OOTD Pipeline</span>
  <nav>
    <button onclick="showView('create')" id="nav-create">Tao moi</button>
    <button onclick="showView('packs')" id="nav-packs" class="active">Tat ca packs</button>
  </nav>
</div>

<div class="container" id="app"></div>

<script>
const API = '';
let currentView = 'packs';
let currentPack = null;

async function api(path, opts) {
  const res = await fetch(API + path, {
    headers: {'Content-Type':'application/json'}, ...opts,
    body: opts?.body ? JSON.stringify(opts.body) : undefined
  });
  return res.json();
}

function toast(msg, isError) {
  const el = document.createElement('div');
  el.className = 'toast' + (isError ? ' error' : '');
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function showView(view, data) {
  currentView = view;
  document.querySelectorAll('.header nav button').forEach(b => b.classList.remove('active'));
  const navBtn = document.getElementById('nav-' + view);
  if (navBtn) navBtn.classList.add('active');

  if (view === 'create') renderCreate();
  else if (view === 'packs') renderPacks();
  else if (view === 'detail') renderDetail(data);
}

function renderCreate() {
  document.getElementById('app').innerHTML = \`
    <div class="form-card">
      <h2>Tao OOTD Pack moi</h2>
      <div class="form-grid">
        <div><label>Niche</label><input id="f-niche" placeholder="casual fashion, streetwear, elegance..."></div>
        <div><label>Mood</label><input id="f-mood" placeholder="warm golden hour, cool night..."></div>
      </div>
      <div class="form-grid full" style="margin-top:12px">
        <div><label>Notes / Mo ta y tuong</label><textarea id="f-notes" placeholder="Vi du: casual summer ootd, linen pants + crop top, rooftop cafe Saigon"></textarea></div>
      </div>
      <div class="form-grid" style="margin-top:12px">
        <div><label>So scene (3-6)</label><input id="f-stages" type="number" value="4" min="3" max="6"></div>
        <div><label>Footwear override</label><input id="f-footwear" placeholder="de trong = elegant beige flat sandals"></div>
      </div>
      <div class="form-grid" style="margin-top:12px">
        <div><label>Platform</label><select id="f-platform"><option value="">Auto</option><option value="tiktok">TikTok</option><option value="reels">Reels</option></select></div>
        <div><label>Country</label><input id="f-country" value="VN"></div>
      </div>
      <div class="btn-row">
        <button class="btn btn-primary" onclick="submitScout()">Scout + Tao Storyboard</button>
        <button class="btn btn-secondary" onclick="submitPipeline()">Full Pipeline (Scout + Image)</button>
      </div>
    </div>
  \`;
}

async function submitScout() {
  const body = gatherForm();
  document.getElementById('app').innerHTML = '<div class="loading"><div class="spinner"></div>Dang suy nghi va tao storyboard...</div>';
  try {
    const res = await api('/api/scout', { method: 'POST', body });
    if (res.ok) {
      toast('Tao pack thanh cong: ' + res.pack_id);
      showView('detail', res.pack_id);
    } else {
      toast(res.error, true);
      showView('create');
    }
  } catch(e) { toast('Loi: ' + e.message, true); showView('create'); }
}

async function submitPipeline() {
  const body = gatherForm();
  document.getElementById('app').innerHTML = '<div class="loading"><div class="spinner"></div>Dang chay pipeline: Scout → Image... (co the mat 1-2 phut)</div>';
  try {
    const res = await api('/api/pipeline', { method: 'POST', body });
    if (res.ok) {
      toast('Pipeline hoan thanh: ' + res.pack_id);
      showView('detail', res.pack_id);
    } else {
      toast(res.error, true);
      showView('create');
    }
  } catch(e) { toast('Loi: ' + e.message, true); showView('create'); }
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

async function renderPacks() {
  document.getElementById('app').innerHTML = '<div class="loading"><div class="spinner"></div>Dang tai...</div>';
  try {
    const res = await api('/api/packs');
    const packs = res.packs || [];
    if (!packs.length) {
      document.getElementById('app').innerHTML = '<div class="empty"><p>Chua co pack nao.</p><button class="btn btn-primary" onclick="showView(\\'create\\')">Tao pack dau tien</button></div>';
      return;
    }
    document.getElementById('app').innerHTML = '<div class="pack-list">' + packs.map(p => \`
      <div class="pack-item" onclick="showView('detail','\${p.pack_id}')">
        <div class="title">\${esc(p.trend_title)}</div>
        <div class="meta">
          <span>\${p.content_type}</span>
          <span>\${p.expected_stage_count} scenes</span>
          <span>\${timeAgo(p.created_at)}</span>
        </div>
        <span class="status status-\${p.status}">\${p.status.replace(/_/g,' ')}</span>
      </div>
    \`).join('') + '</div>';
  } catch(e) {
    document.getElementById('app').innerHTML = '<div class="empty"><p>Loi tai danh sach: ' + esc(e.message) + '</p></div>';
  }
}

async function renderDetail(packId) {
  currentPack = packId;
  document.getElementById('app').innerHTML = '<div class="loading"><div class="spinner"></div>Dang tai pack...</div>';
  try {
    const res = await api('/api/packs/' + packId);
    if (!res.ok) { toast(res.error, true); return showView('packs'); }
    const pack = res.pack;
    const shots = res.shots || [];

    let html = \`
      <div class="detail-header">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
          <button class="btn btn-secondary btn-sm" onclick="showView('packs')">&larr; Quay lai</button>
          <h2>\${esc(pack.trend_title)}</h2>
          <span class="status status-\${pack.status}">\${pack.status.replace(/_/g,' ')}</span>
        </div>
        <div class="info">
          <span>\${pack.pack_id}</span>
          <span>\${pack.content_type}</span>
          <span>\${pack.story_pattern}</span>
          <span>\${pack.editing_style}</span>
          <span>Anchor: \${esc(pack.visual_anchor || '')}</span>
        </div>
      </div>

      <div class="btn-row" style="margin-bottom:16px">
        <button class="btn btn-primary btn-sm" onclick="runPublish('\${packId}')">Gen Caption / Hashtags</button>
        <button class="btn btn-secondary btn-sm" onclick="uploadAllVideos('\${packId}')">Upload tat ca video</button>
      </div>
    \`;

    // Publish info
    if (pack.caption) {
      html += \`<div class="publish-card">
        <h3>Publish Metadata</h3>
        <div class="publish-field"><label>Hook</label><p>\${esc(pack.hook || '')}</p></div>
        <div class="publish-field"><label>Cover Text</label><p>\${esc(pack.cover_text || '')}</p></div>
        <div class="publish-field"><label>Caption</label><p>\${esc(pack.caption)}</p></div>
        <div class="publish-field"><label>Hashtags</label><p>\${esc(pack.hashtags || '')}</p></div>
      </div>\`;
    }

    // Shots
    html += '<h3 style="margin-top:24px;margin-bottom:4px;font-size:15px;color:var(--accent2)">Shots</h3>';
    html += '<div class="shots-grid">';
    for (const s of shots) {
      const scene = s.scene_json ? JSON.parse(s.scene_json) : {};
      html += \`<div class="shot-card">
        <div class="shot-head">
          <h3>Shot \${s.shot_number}</h3>
          <span class="status status-\${s.status}">\${s.status.replace(/_/g,' ')}</span>
        </div>
        \${s.first_frame_url && !s.first_frame_url.startsWith('data:') ? \`<img src="\${s.first_frame_url}" alt="Shot \${s.shot_number}">\` : ''}
        \${s.video_url ? \`<video src="\${s.video_url}" controls></video>\` : ''}
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
          <button class="btn btn-secondary btn-sm" style="margin-top:6px" onclick="uploadVideo('\${packId}',\${s.shot_number})">Upload Video</button>
        </div>
      </div>\`;
    }
    html += '</div>';

    document.getElementById('app').innerHTML = html;
  } catch(e) {
    toast('Loi: ' + e.message, true);
    showView('packs');
  }
}

async function uploadVideo(packId, shotNum) {
  const url = document.getElementById('vid-' + shotNum)?.value?.trim();
  if (!url) return toast('Nhap video URL truoc', true);
  try {
    const res = await api('/api/video/' + packId, {
      method: 'POST',
      body: { shots: [{ shot_number: shotNum, video_url: url }] }
    });
    if (res.ok) toast('Upload shot ' + shotNum + ' thanh cong');
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
  if (!shots.length) return toast('Nhap it nhat 1 video URL', true);
  try {
    const res = await api('/api/video/' + packId, { method: 'POST', body: { shots } });
    if (res.ok) toast('Upload ' + shots.length + ' videos thanh cong');
    else toast(res.error, true);
    renderDetail(packId);
  } catch(e) { toast(e.message, true); }
}

async function runPublish(packId) {
  toast('Dang gen caption...');
  try {
    const res = await api('/api/publish/' + packId, { method: 'POST' });
    if (res.ok) toast('Gen publish metadata thanh cong!');
    else toast(res.error, true);
    renderDetail(packId);
  } catch(e) { toast(e.message, true); }
}

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff/60000);
  if (m < 60) return m + ' phut truoc';
  const h = Math.floor(m/60);
  if (h < 24) return h + ' gio truoc';
  return Math.floor(h/24) + ' ngay truoc';
}

// Init
showView('packs');
</script>
</body>
</html>`;
}
