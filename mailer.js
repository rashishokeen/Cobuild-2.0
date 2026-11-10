'use strict';

const nodemailer = require('nodemailer');
require('dotenv').config();

const MAIL_ENABLED = process.env.MAIL_ENABLED === 'true';

/** Build a transporter (or a no-op stub in dev) */
function createTransporter() {
  if (!MAIL_ENABLED) {
    return {
      sendMail: async (opts) => {
        console.log('[Mail stub] Would send email:', opts.subject);
        return { messageId: 'dev-stub' };
      },
    };
  }

  return nodemailer.createTransport({
    host:   process.env.MAIL_HOST   || 'smtp.gmail.com',
    port:   parseInt(process.env.MAIL_PORT || '587', 10),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });
}

const transporter = createTransporter();

/**
 * Send notification email when a contact form is submitted.
 * @param {{ name: string, email: string, type: string, message: string }} data
 */
async function sendContactNotification(data) {
  const { name, email, type, message } = data;

  await transporter.sendMail({
    from:    process.env.MAIL_FROM || 'team.cobuildd@gmail.com',
    to:      process.env.MAIL_TO   || 'team.cobuildd@gmail.com',
    subject: `[CoBuild Contact] ${type} — ${name}`,
    text: `
New contact form submission on CoBuild.

Name:    ${name}
Email:   ${email}
Type:    ${type}
Message:
${message}

Submitted at: ${new Date().toISOString()}
    `.trim(),
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#f5f0e8;padding:2rem;border-radius:8px;">
        <div style="background:#f0a500;padding:1rem 1.5rem;border-radius:4px;margin-bottom:1.5rem;">
          <strong style="font-size:1.1rem;">New CoBuild Contact</strong>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:.4rem 0;color:#6b6560;width:80px;"><strong>Name</strong></td><td>${name}</td></tr>
          <tr><td style="padding:.4rem 0;color:#6b6560;"><strong>Email</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:.4rem 0;color:#6b6560;"><strong>Type</strong></td><td>${type}</td></tr>
        </table>
        <div style="margin-top:1rem;padding:1rem;background:#fff;border-radius:4px;border-left:3px solid #f0a500;">
          <p style="margin:0;white-space:pre-wrap;">${message}</p>
        </div>
        <p style="margin-top:1.5rem;font-size:.8rem;color:#aba59d;">Submitted at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
      </div>
    `,
  });
}

/**
 * Send a confirmation email to the person who submitted the contact form.
 * @param {{ name: string, email: string }} data
 */
async function sendContactConfirmation(data) {
  const { name, email } = data;

  await transporter.sendMail({
    from:    process.env.MAIL_FROM || 'team.cobuildd@gmail.com',
    to:      email,
    subject: `Thanks for reaching out, ${name}!`,
    text: `Hi ${name},\n\nWe got your message and will be in touch shortly.\n\n— The CoBuild Team`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#f5f0e8;padding:2rem;border-radius:8px;">
        <div style="background:#f0a500;padding:1rem 1.5rem;border-radius:4px;margin-bottom:1.5rem;">
          <strong>CoBuild</strong> — Where Ideas Find Builders
        </div>
        <h2 style="font-family:Georgia,serif;font-weight:normal;">Hey ${name} 👋</h2>
        <p>Thanks for reaching out! We've received your message and someone from the team will get back to you shortly.</p>
        <p style="margin-top:1.5rem;color:#6b6560;font-size:.9rem;">In the meantime, join our WhatsApp community to connect with builders right now.</p>
        <a href="https://chat.whatsapp.com/EelRt8CGKeU09pI7OBNC9F" style="display:inline-block;margin-top:1rem;background:#1a1a1a;color:#fff;padding:.75rem 1.5rem;border-radius:6px;text-decoration:none;font-size:.875rem;">Join the Community ↗</a>
        <hr style="margin:2rem 0;border:none;border-top:1px solid rgba(26,26,26,.1);" />
        <p style="font-size:.75rem;color:#aba59d;">© 2026 CoBuild. Built by builders, for builders.</p>
      </div>
    `,
  });
}

/**
 * Send a waitlist confirmation email.
 * @param {{ name: string, email: string, edition: string }} data
 */
async function sendWaitlistConfirmation(data) {
  const { name, email, edition } = data;

  await transporter.sendMail({
    from:    process.env.MAIL_FROM || 'team.cobuildd@gmail.com',
    to:      email,
    subject: `You're on the ${edition} waitlist, ${name}!`,
    text: `Hi ${name},\n\nYou're on the waitlist for ${edition}. We'll notify you as soon as registration opens.\n\n— CoBuild Team`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#1a1a1a;color:#f5f0e8;padding:2rem;border-radius:8px;">
        <div style="background:#f0a500;color:#1a1a1a;padding:1rem 1.5rem;border-radius:4px;margin-bottom:1.5rem;">
          <strong>CoBuild Hackathons</strong>
        </div>
        <h2 style="font-family:Georgia,serif;font-weight:normal;">You're on the list, ${name}.</h2>
        <p style="color:#aba59d;">We'll notify you the moment ${edition} registration opens. Keep building until then.</p>
        <hr style="margin:2rem 0;border:none;border-top:1px solid rgba(255,255,255,.1);" />
        <p style="font-size:.75rem;color:#6b6560;">© 2026 CoBuild. Built by builders, for builders.</p>
      </div>
    `,
  });
}

module.exports = { sendContactNotification, sendContactConfirmation, sendWaitlistConfirmation };
