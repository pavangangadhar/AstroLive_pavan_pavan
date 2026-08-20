const { id, mutate, sendError } = require('./_lib/store');
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const order = { id: id('voice'), status: 'queued', price: '₹149', astrologer: 'Maya Sharma', sla: 'Response within 4 hours', duration: '3 min response', createdAt: new Date().toISOString() };
    await mutate(store => { store.voiceOrders.push(order); return order; });
    res.status(200).json(order);
  } catch (error) { sendError(res, error); }
};
