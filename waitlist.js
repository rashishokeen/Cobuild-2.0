'use strict';

const { Router }     = require('express');
const { body, validationResult } = require('express-validator');
const { stmts }      = require('../db/database');
const { sendWaitlistConfirmation } = require('../mailer');

const router = Router();

/** Validation rules */
const waitlistValidation = [
  body('name')
    .trim().notEmpty().withMessage('Name is required.')
    .isLength({ max: 100 }).withMessage('Name must be under 100 characters.'),
  body('email')
    .trim().notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Enter a valid email address.')
    .normalizeEmail(),
  body('role')
    .trim()
    .isIn(['developer', 'designer', 'founder', 'student', 'freelancer', 'other'])
    .withMessage('Invalid role.'),
  body('edition')
    .trim().optional()
    .isIn(['codebuild-2', 'codebuild-3'])
    .withMessage('Invalid edition.'),
];

/** POST /api/waitlist */
router.post('/', waitlistValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  const { name, email, role, edition = 'codebuild-2' } = req.body;
  const ip = req.ip;

  try {
    const info = stmts.insertWaitlist.run({ name, email, role, edition, ip });

    // If 0 rows changed, email already registered
    if (info.changes === 0) {
      return res.status(200).json({
        success: true,
        message: "You're already on the waitlist. We'll notify you when registration opens!",
        duplicate: true,
      });
    }

    sendWaitlistConfirmation({ name, email, edition }).catch((err) =>
      console.error('[Mailer] Waitlist confirmation error:', err.message)
    );

    return res.status(201).json({
      success: true,
      message: "You're on the list! We'll notify you when registration opens.",
      id: info.lastInsertRowid,
    });
  } catch (err) {
    console.error('[Waitlist route]', err.message);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
