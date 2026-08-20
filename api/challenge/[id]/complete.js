const { mutate, sendError } = require('./_lib/store');
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const challengeId = req.query.id;
    let updated;
    await mutate(store => {
      const item = store.challenges.find(x => x.id === challengeId);
      if (!item) throw new Error('Challenge not found');
      item.day = Math.min(item.total, item.day + 1);
      item.completedAt = new Date().toISOString();
      item.next = item.day >= item.total ? 'Challenge complete — your decision journey is ready for review.' : 'Write one sentence about what changed in your confidence today.';
      updated = item;
      return item;
    });
    res.status(200).json(updated);
  } catch (error) { sendError(res, error); }
};
