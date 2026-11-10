'use strict';

const { Router }     = require('express');
const { body, validationResult } = require('express-validator');
const { stmts }      = require('../db/database');

const router = Router();

/** POST /api/newsletter */
router.post(
  '/',
  [
    body('email')
      .trim().notEmpty().withMessage('Email is required.')
      .isEmail().withMessage('Enter a valid email address.')
      .normalizeEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { email } = req.body;
    const ip = req.ip;

    try {
      const info = stmts.insertNewsletter.run({ email, ip });

      if (info.changes === 0) {
        return res.status(200).json({
          success: true,
          message: "You're already subscribed!",
          duplicate: true,
        });
      }

      return res.status(201).json({
        success: true,
        message: "You're subscribed! Expect good things.",
      });
    } catch (err) {
      console.error('[Newsletter route]', err.message);
      return res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
  }
);

module.exports = router;
