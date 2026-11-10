'use strict';

const { Router } = require('express');
const { stmts }  = require('../db/database');

const router = Router();

/** GET /api/stats — public community stats */
router.get('/', (_req, res) => {
  try {
    const stats = stmts.getStats.get();
    return res.json({
      success: true,
      data: {
        impressions: '512K+',
        waitlist:    stats.total_waitlist   || 0,
        newsletter:  stats.total_newsletter || 0,
        contacts:    stats.total_contacts   || 0,
      },
    });
  } catch (err) {
    console.error('[Stats route]', err.message);
    return res.status(500).json({ success: false, message: 'Could not fetch stats.' });
  }
});

module.exports = router;
