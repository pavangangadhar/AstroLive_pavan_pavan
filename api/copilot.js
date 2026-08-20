module.exports = async (req, res) => {
  res.status(200).json({
    user: 'Priya Sharma',
    topic: 'Career promotion & overseas opportunity',
    setup: 18,
    highlights: [
      'Jupiter–Venus period: transition window',
      'Saturn emphasis: structure before expansion',
      'Previous question: promotion timing',
      'Preference: concise guidance'
    ],
    starter: 'Are you negotiating a major contract or foreign assignment right now?'
  });
};
