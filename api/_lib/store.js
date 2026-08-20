const crypto = require('crypto');

const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const DATA_PATH = process.env.GITHUB_DATA_PATH || 'data/store.json';
const TOKEN = process.env.GITHUB_TOKEN;

function id(prefix) {
  return `${prefix}-${crypto.randomBytes(5).toString('hex')}`;
}

function githubConfigured() {
  return Boolean(TOKEN && OWNER && REPO);
}

function githubHeaders() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json'
  };
}

function githubUrl(path = '') {
  return `https://api.github.com/repos/${encodeURIComponent(OWNER)}/${encodeURIComponent(REPO)}/contents/${path}`;
}

function fallbackStore() {
  return {
    version: 1,
    decisions: [],
    challenges: [],
    synastry: [],
    voiceOrders: [],
    consultations: [],
    events: []
  };
}

async function readStore() {
  if (!githubConfigured()) return { store: fallbackStore(), sha: null, persistent: false };
  const response = await fetch(`${githubUrl(DATA_PATH)}?ref=${encodeURIComponent(BRANCH)}`, {
    headers: githubHeaders()
  });
  if (response.status === 404) {
    const store = fallbackStore();
    const saved = await writeStore(store, null);
    return { store, sha: saved.sha, persistent: true };
  }
  if (!response.ok) {
    throw new Error(`GitHub read failed (${response.status})`);
  }
  const payload = await response.json();
  const decoded = Buffer.from(payload.content.replace(/\n/g, ''), 'base64').toString('utf8');
  return { store: JSON.parse(decoded), sha: payload.sha, persistent: true };
}

async function writeStore(store, sha) {
  if (!githubConfigured()) return { sha: null, persistent: false };
  const body = {
    message: `AstroLive GrowthOS data update ${new Date().toISOString()}`,
    content: Buffer.from(JSON.stringify(store, null, 2) + '\n').toString('base64'),
    branch: BRANCH
  };
  if (sha) body.sha = sha;
  const response = await fetch(githubUrl(DATA_PATH), {
    method: 'PUT',
    headers: githubHeaders(),
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub write failed (${response.status}): ${text.slice(0, 240)}`);
  }
  const payload = await response.json();
  return { sha: payload.content?.sha || null, persistent: true };
}

async function mutate(mutator) {
  const current = await readStore();
  const result = await mutator(current.store);
  await writeStore(current.store, current.sha);
  return result;
}

function sendError(res, error) {
  console.error(error);
  const status = /GitHub write failed|GitHub read failed/.test(error.message) ? 502 : 500;
  res.status(status).json({
    error: 'Storage service error',
    detail: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}

module.exports = { id, readStore, writeStore, mutate, githubConfigured, sendError };
