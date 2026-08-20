const { id, mutate, sendError } = require('./_lib/store');
const body = require('./_lib/body');
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const b = await body(req);
    const a = String(b.personA || 'You').slice(0, 80);
    const c = String(b.personB || 'Your friend').slice(0, 80);
    const seed = [...(a + c)].reduce((x, ch) => x + ch.charCodeAt(0), 0);
    const result = {
      id: id('synastry'), a, b: c, overall: 72 + (seed % 24),
      hidden: ['Communication rhythm', 'Moon–Mercury tension', 'Shared ambition', 'Different decision tempo'][seed % 4],
      reward: '50 AstroCredits each', createdAt: new Date().toISOString()
    };
    await mutate(store => { store.synastry.push(result); store.events.push({ type: 'synastry_created', at: result.createdAt, id: result.id }); return result; });
    res.status(200).json(result);
  } catch (error) { sendError(res, error); }
};
