const $ = (s) => document.querySelector(s);
let did = 'demo';
let initialized = false;

function tab(id, updateHash = true) {
  const tabs = document.querySelectorAll('.tab');
  const buttons = document.querySelectorAll('nav button');
  const target = document.getElementById(id) || document.getElementById('home');
  const activeId = target ? target.id : 'home';

  tabs.forEach((section) => section.classList.toggle('active', section === target));
  buttons.forEach((button) => button.classList.toggle('active', button.dataset.t === activeId));

  if (updateHash) {
    const nextHash = activeId === 'home' ? '' : `#${activeId}`;
    if (window.location.hash !== nextHash) {
      history.replaceState(null, '', `${window.location.pathname}${nextHash}`);
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toast(message) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = message;
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => { el.textContent = ''; }, 2600);
}

async function api(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({ error: `Server returned ${response.status}` }));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
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

async function handleDecisionSubmit(e) {
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
}

async function invite() {
  try {
    const x = await api(`/api/decision/${encodeURIComponent(did)}/invite`, { method: 'POST' });
    $('#extra').innerHTML = `<div class="card"><b>✨ Invite ready</b><p>${escapeHtml(x.url)}</p><p>Both sides can receive ${escapeHtml(x.reward)}.</p><button class="secondary" id="copyInvite">Copy invite</button></div>`;
    $('#copyInvite').onclick = async () => {
      try { await navigator.clipboard.writeText(x.url); toast('Invite link copied'); }
      catch { toast('Invite ready — copy the link above'); }
    };
    toast('Utility-gated invite created');
  } catch (err) { toast(err.message); }
}

async function challenge() {
  try {
    const x = await api('/api/challenge', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ decisionId: did })
    });
    $('#extra').innerHTML = `<div class="card"><small>DAY ${x.day}/7</small><h3>${escapeHtml(x.prompt)}</h3><p>Reward +${x.reward} credits</p><button class="primary" onclick="complete('${escapeHtml(x.id)}')">Complete Day 1</button></div>`;
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

async function voice() {
  try {
    const x = await api('/api/voice', { method: 'POST' });
    toast(`${x.status.toUpperCase()} · ${x.astrologer} · ${x.price} · ${x.sla}`);
  } catch (err) { toast(err.message); }
}

async function initializeEnhancements() {
  // Home is intentionally rendered synchronously. API calls are enhancements and
  // must never block the initial Home screen.
  try {
    const health = await api('/api/health');
    const status = $('#storageStatus');
    if (status) status.textContent = health.storage === 'github-backed'
      ? 'Backend: GitHub-backed datastore'
      : 'Backend: demo fallback';
  } catch (err) {
    const status = $('#storageStatus');
    if (status) status.textContent = 'Backend: offline demo mode';
  }

  try {
    const daily = await api('/api/daily');
    const cards = $('#dailycards');
    if (cards && Array.isArray(daily.cards)) {
      cards.innerHTML = daily.cards.map((x) => `<article class="card"><small>${escapeHtml(x[0].toUpperCase())}</small><h3>${escapeHtml(x[1])}</h3><p>${escapeHtml(x[2])}</p><button class="secondary" onclick="toast('Saved to Journey')">Save</button></article>`).join('');
    }
  } catch (err) {
    const cards = $('#dailycards');
    if (cards) cards.innerHTML = '<article class="card"><h3>Daily signal</h3><p>Demo content is available. Backend sync can be restored without blocking the Home experience.</p></article>';
  }

}



async function handleCopilotSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const result = $('#copilotResult');
  const button = form.querySelector('button[type="submit"]');
  const originalText = button ? button.textContent : '';
  try {
    if (button) { button.disabled = true; button.textContent = 'Preparing brief…'; }
    if (result) result.innerHTML = '<small>AI CONTEXT BRIEF</small><h3>Preparing…</h3><p>Structuring the consultation context for the astrologer.</p>';

    const payload = Object.fromEntries(new FormData(form));
    const x = await api('/api/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (result) {
      const highlights = Array.isArray(x.highlights) ? x.highlights : [];
      result.innerHTML = `
        <small>AI CONTEXT BRIEF · ${escapeHtml(x.setup)}s</small>
        <h3>${escapeHtml(x.clientName || payload.clientName)} · ${escapeHtml(x.topic || payload.topic)}</h3>
        <p><b>Client question:</b> ${escapeHtml(x.question || payload.question)}</p>
        <ul>${highlights.map((h) => `<li>✦ ${escapeHtml(h)}</li>`).join('')}</ul>
        <div class="starter"><b>Conversation starter</b><p>${escapeHtml(x.starter)}</p></div>
        <p class=guard>Human astrologer remains responsible for interpretation. AI is an assistant, not the oracle.</p>`;
    }
    toast('Co-Pilot brief generated');
  } catch (err) {
    if (result) result.innerHTML = `<small>CO-PILOT ERROR</small><h3>Could not generate the brief</h3><p>${escapeHtml(err.message)}</p><p>Check the deployment/API connection and try again.</p>`;
    toast(err.message);
  } finally {
    if (button) { button.disabled = false; button.textContent = originalText; }
  }
}

function initializeApp() {
  if (initialized) return;
  initialized = true;

  document.querySelectorAll('nav button').forEach((button) => {
    button.addEventListener('click', () => tab(button.dataset.t));
  });

  const df = $('#df');
  if (df) df.addEventListener('submit', handleDecisionSubmit);

  const cpf = $('#cpf');
  if (cpf) cpf.addEventListener('submit', handleCopilotSubmit);

  const sf = $('#sf');
  if (sf) sf.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const x = await api('/api/synastry', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(e.target)))
      });
      $('#sc').innerHTML = `<small>COSMIC MATCH</small><h3>${escapeHtml(x.a)} × ${escapeHtml(x.b)}</h3><div class="match">${x.overall}%</div><p>Overall harmony</p><div class="secret">◉ Hidden dynamic detected<br><b>${escapeHtml(x.hidden)}</b></div><button class="share" onclick="toast('Share ready · both sides receive 50 credits')">Share ↗</button>`;
      toast('Synastry card created and saved');
    } catch (err) { toast(err.message); }
  });

  // Always show Home immediately on first load. A hash can opt into a tab.
  const requested = window.location.hash.replace('#', '');
  tab(document.getElementById(requested) ? requested : 'home', false);

  // Run API enhancements after the UI has painted.
  if ('requestIdleCallback' in window) requestIdleCallback(initializeEnhancements, { timeout: 1200 });
  else setTimeout(initializeEnhancements, 0);
}

window.addEventListener('hashchange', () => {
  const requested = window.location.hash.replace('#', '');
  tab(document.getElementById(requested) ? requested : 'home', false);
});

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeApp);
else initializeApp();
