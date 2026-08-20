const { id, mutate, sendError } = require('./_lib/store');
const body = require('./_lib/body');

function score(q, c) {
  const s = [...q, ...c].reduce((a, x) => a + x.charCodeAt(0), 0);
  const n = x => 60 + ((s * x) % 37);
  const risk = 25 + ((s * 5) % 45);
  const factors = [
    ['Growth', n(7)],
    ['Timing', n(13)],
    ['Stability', n(11)],
    ['Risk comfort', 100 - risk]
  ];
  const clarity = Math.max(55, Math.min(96, Math.round(factors.reduce((a, x) => a + x[1], 0) / factors.length)));
  return { clarity, factors };
}

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      return res.status(200).json({
        id: 'demo',
        title: 'Should I accept the new product role?',
        category: 'Career',
        options: ['Accept the role', 'Stay in current role'],
        clarity: 84,
        factors: [['Growth', 91], ['Timing', 88], ['Stability', 73], ['Risk comfort', 61]],
        insight: 'Strong growth signal with a watch-out around transition load.',
        window: 'Next 6–10 weeks'
      });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const b = await body(req);
    if (!b.title || !b.category || !b.optionA || !b.optionB) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const s = score(String(b.title), String(b.category));
    const decision = {
      id: id('decision'),
      title: String(b.title).slice(0, 160),
      category: String(b.category),
      options: [String(b.optionA).slice(0, 120), String(b.optionB).slice(0, 120)],
      ...s,
      insight: `Your ${String(b.category).toLowerCase()} decision shows a stronger signal for deliberate action. Test assumptions before committing.`,
      window: 'Next 6–10 weeks',
      createdAt: new Date().toISOString()
    };
    const saved = await mutate(store => { store.decisions.push(decision); store.events.push({ type: 'decision_created', at: decision.createdAt, id: decision.id }); return decision; });
    return res.status(200).json(saved);
  } catch (error) { return sendError(res, error); }
};
