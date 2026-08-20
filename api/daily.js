module.exports = async (req, res) => {
  res.status(200).json({
    streak: 4,
    credits: 120,
    cards: [
      ['Jupiter', 'Expansion', 'Say yes to one learning opportunity.'],
      ['Saturn', 'Structure', 'Protect one focused block today.'],
      ['Moon', 'Reflection', 'Notice where emotion changes your decision.']
    ]
  });
};
