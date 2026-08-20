const { githubConfigured } = require('./_lib/store');
module.exports = async (req, res) => {
  res.status(200).json({
    ok: true,
    service: 'AstroLive GrowthOS API',
    storage: githubConfigured() ? 'github-backed' : 'demo-memory-fallback',
    timestamp: new Date().toISOString()
  });
};
