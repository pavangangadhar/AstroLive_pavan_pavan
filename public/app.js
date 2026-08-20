const $ = (s) => document.querySelector(s);
let did = 'demo';

function tab(id) {
  document.querySelectorAll('.tab').forEach((x) => x.classList.remove('active'));
  const target = $('#' + id);
  if (target) target.classList.add('active');
  document.querySelectorAll('nav button').forEach((x) => x.classList.toggle('active', x.dataset.t === id));
}

document.querySelectorAll('nav button').forEach((x) => x.addEventListener('click', () => tab(x.dataset.t)));

function toast(message) {
  $('#toast').textContent = message;
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => { $('#toast').textContent = ''; }, 2600);
}

async function api(url, options) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({ error: 'Invalid server response' }));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function renderDecision(d) {
  $('#res').innerHTML = `
    <small>DECISION MAP · ${escapeHtml(d.category)}</small>
    <h3>${escapeHtml(d.title)}</h3>
    <div class="score">${d.clarity}<span>/100</span></div>
    ${d.factors.map(([name, value]) => `<p>${escapeHtml(name)} <b>${value}</b><i style="display:block;width:${value}%;height:6px;background:linear-gradient(90deg,#9b78ff,#7fe6d0);border-radius:9px"></i></p>`).join('')}
    <p>${escapeHtml(d.insight)}</p>
    <p><b>Window:</b> ${escapeHtml(d.window)}</p>
    <button class="secondary" onclick="invite()">Invite Circle</button>
    <button class="secondary" onclick="challenge()">7-Day Challenge</button>
    <button class="primary" onclick="consult('${escapeHtml(d.category)}')">Find Astrologer</button>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
}

$('#df').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const d = await api('/api/decision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(e.target)))
    });
    did = d.id;
    renderDecision(d);
    toast('Decision Map created and saved');
  } catch (err) { toast(err.message); }
});

async function invite() {
  try {
    const x = await api(`/api/decision/${encodeURIComponent(did)}/invite`, { method: 'POST' });
    $('#extra').innerHTML = `<div class="card"><b>✨ Invite ready</b><p>${escapeHtml(x.url)}</p><p>Both sides can receive ${escapeHtml(x.reward)}.</p><button class="secondary" onclick="navigator.clipboard?.writeText('${escapeHtml(x.url)}');toast('Invite link copied')">Copy invite</button></div>`;
    toast('Utility-gated invite created');
  } catch (err) { toast(err.message); }
}

async function challenge() {
  try {
    const x = await api('/api/challenge', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ decisionId: did })
    });
    $('#extra').innerHTML = `<div class="card"><small>DAY ${x.day}/7</small><h3>${escapeHtml(x.prompt)}</h3><p>Reward +${x.reward} credits</p><button class="primary" onclick="complete('${x.id}')">Complete Day 1</button></div>`;
  } catch (err) { toast(err.message); }
}

async function complete(id) {
  try {
    const x = await api(`/api/challenge/${encodeURIComponent(id)}/complete`, { method: 'POST' });
    $('#extra').innerHTML = `<div class="card"><h3>✓ Day complete</h3><p>${escapeHtml(x.next)}</p></div>`;
    toast('Clarity +20');
  } catch (err) { toast(err.message); }
}

async function consult(category) {
  try {
    const x = await api('/api/consult', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ category })
    });
    toast(`Matched ${x.match} · ${x.rate} · ${x.setup}s setup`);
  } catch (err) { toast(err.message); }
}

$('#sf').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const x = await api('/api/synastry', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(e.target)))
    });
    $('#sc').innerHTML = `<small>COSMIC MATCH</small><h3>${escapeHtml(x.a)} × ${escapeHtml(x.b)}</h3><div class="match">${x.overall}%</div><p>Overall harmony</p><div class="secret">◉ Hidden dynamic detected<br><b>${escapeHtml(x.hidden)}</b></div><button class="share" onclick="toast('Share ready · both sides receive 50 credits')">Share ↗</button>`;
    toast('Synastry card created and saved');
  } catch (err) { toast(err.message); }
});

async function voice() {
  try {
    const x = await api('/api/voice', { method: 'POST' });
    toast(`${x.status.toUpperCase()} · ${x.astrologer} · ${x.price} · ${x.sla}`);
  } catch (err) { toast(err.message); }
}

(async () => {
  try {
    const health = await api('/api/health');
    $('#storageStatus').textContent = health.storage === 'github-backed' ? 'Backend: GitHub-backed datastore' : 'Backend: demo fallback';
    const daily = await api('/api/daily');
    $('#dailycards').innerHTML = daily.cards.map((x) => `<article class="card"><small>${escapeHtml(x[0].toUpperCase())}</small><h3>${escapeHtml(x[1])}</h3><p>${escapeHtml(x[2])}</p><button class="secondary" onclick="toast('Saved to Journey')">Save</button></article>`).join('');
    const copilot = await api('/api/copilot');
    $('#brief').innerHTML = copilot.highlights.map((x) => `<li>✦ ${escapeHtml(x)}</li>`).join('');
    $('#starter').innerHTML = `<b>Conversation starter</b><p>${escapeHtml(copilot.starter)}</p>`;
  } catch (err) {
    $('#storageStatus').textContent = 'Backend unavailable';
    toast(err.message);
  }
})();
