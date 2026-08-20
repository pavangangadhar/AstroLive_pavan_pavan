const { id, mutate, sendError } = require('./_lib/store');
const body = require('./_lib/body');
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const b = await body(req);
    const consultation = { id: id('consult'), match: 'Maya Sharma', rate: '₹18/min', setup: 18, specialty: b.category || 'Career', createdAt: new Date().toISOString() };
    await mutate(store => { store.consultations.push(consultation); return consultation; });
    res.status(200).json(consultation);
  } catch (error) { sendError(res, error); }
};
