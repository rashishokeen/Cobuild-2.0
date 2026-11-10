'use strict';

const { Router }     = require('express');
const { body, validationResult } = require('express-validator');
const { stmts }      = require('../db/database');
const { sendContactNotification, sendContactConfirmation } = require('../mailer');

const router = Router();

/** Validation rules */
const contactValidation = [
  body('name')
    .trim().notEmpty().withMessage('Name is required.')
    .isLength({ max: 100 }).withMessage('Name must be under 100 characters.'),
  body('email')
    .trim().notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Enter a valid email address.')
    .normalizeEmail(),
  body('type')
    .trim()
    .isIn(['general', 'partnership', 'hackathon', 'press', 'other'])
    .withMessage('Invalid inquiry type.'),
  body('message')
    .trim().notEmpty().withMessage('Message is required.')
    .isLength({ min: 10, max: 2000 }).withMessage('Message must be 10–2000 characters.'),
];

/** POST /api/contact */
router.post('/', contactValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  const { name, email, type, message } = req.body;
  const ip = req.ip;

  try {
    // Save to DB
    const info = stmts.insertContact.run({ name, email, type, message, ip });

    // Send emails (non-blocking — don't fail the request if email fails)
    sendContactNotification({ name, email, type, message }).catch((err) =>
      console.error('[Mailer] Notification error:', err.message)
    );
    sendContactConfirmation({ name, email }).catch((err) =>
      console.error('[Mailer] Confirmation error:', err.message)
    );

    return res.status(201).json({
      success: true,
      message: "Thanks! We'll be in touch shortly.",
      id: info.lastInsertRowid,
    });
  } catch (err) {
    console.error('[Contact route]', err.message);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
