const { id, mutate, sendError } = require('./_lib/store');
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const decisionId = req.query.id;
    const invite = { id: id('invite'), decisionId, joinId: id('join'), reward: '50 AstroCredits', createdAt: new Date().toISOString() };
    const host = req.headers.host;
    const proto = req.headers['x-forwarded-proto'] || 'https';
    invite.url = `${proto}://${host}/invite/${invite.joinId}`;
    await mutate(store => { store.events.push({ type: 'invite_created', ...invite }); return invite; });
    res.status(200).json(invite);
  } catch (error) { sendError(res, error); }
};
