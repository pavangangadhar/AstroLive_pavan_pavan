const body = require('./_lib/body');

function clean(value, fallback = '') {
  return String(value ?? fallback).trim().slice(0, 500);
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      clientName: 'Priya Sharma',
      topic: 'Career promotion & overseas opportunity',
      question: 'What should I consider before accepting the overseas opportunity?',
      setup: 18,
      highlights: [
        'Clarify the client’s primary goal before interpreting the chart.',
        'Separate timing questions from practical career constraints.',
        'Review the previous question and stated preference for concise guidance.'
      ],
      starter: 'What outcome would make this opportunity feel worthwhile to you?'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const input = await body(req);
    const clientName = clean(input.clientName, 'Client');
    const topic = clean(input.topic, 'General consultation');
    const question = clean(input.question, 'What would you like guidance on?');
    const previousContext = clean(input.previousContext);

    const highlights = [
      `Primary topic: ${topic}`,
      `Start with the client’s exact question: “${question}”`,
      previousContext
        ? `Previous context to review: ${previousContext}`
        : 'No previous context supplied; ask one clarifying question before interpreting.',
      'Keep practical constraints separate from astrological interpretation.',
      'Use neutral language and avoid presenting astrology as guaranteed outcomes.'
    ];

    const starter = previousContext
      ? `Given what you shared earlier, what has changed most since your last question?`
      : `What matters most to you about ${topic.toLowerCase()} right now?`;

    return res.status(200).json({
      ok: true,
      clientName,
      topic,
      question,
      setup: 18,
      highlights,
      starter
    });
  } catch (error) {
    return res.status(400).json({ error: 'Invalid Co-Pilot request.' });
  }
};
