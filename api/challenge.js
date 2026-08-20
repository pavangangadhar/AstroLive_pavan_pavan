const { id, mutate, sendError } = require('./_lib/store');
const body = require('./_lib/body');
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const b = await body(req);
    const challenge = {
      id: id('challenge'), decisionId: b.decisionId || 'demo', day: 1, total: 7,
      prompt: 'Ask someone you trust: What risk am I underestimating?', reward: 20,
      createdAt: new Date().toISOString()
    };
    await mutate(store => { store.challenges.push(challenge); return challenge; });
    res.status(200).json(challenge);
  } catch (error) { sendError(res, error); }
};
