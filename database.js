'use strict';

const Database = require('better-sqlite3');
const path     = require('path');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH || './server/db/cobuild.db';
const resolved = path.resolve(process.cwd(), DB_PATH);

/** Singleton SQLite connection */
const db = new Database(resolved, {
  // verbose: process.env.NODE_ENV !== 'production' ? console.log : undefined,
});

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ──────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    email       TEXT    NOT NULL,
    type        TEXT    NOT NULL DEFAULT 'general',
    message     TEXT    NOT NULL,
    ip          TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS waitlist (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    email       TEXT    NOT NULL UNIQUE,
    role        TEXT    NOT NULL DEFAULT 'builder',
    edition     TEXT    NOT NULL DEFAULT 'codebuild-2',
    ip          TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS newsletter (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    email       TEXT    NOT NULL UNIQUE,
    ip          TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

// ── Prepared statements ─────────────────────────────────────────────────────

const stmts = {
  insertContact: db.prepare(`
    INSERT INTO contacts (name, email, type, message, ip)
    VALUES (@name, @email, @type, @message, @ip)
  `),

  insertWaitlist: db.prepare(`
    INSERT OR IGNORE INTO waitlist (name, email, role, edition, ip)
    VALUES (@name, @email, @role, @edition, @ip)
  `),

  insertNewsletter: db.prepare(`
    INSERT OR IGNORE INTO newsletter (email, ip)
    VALUES (@email, @ip)
  `),

  getStats: db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM contacts)    AS total_contacts,
      (SELECT COUNT(*) FROM waitlist)    AS total_waitlist,
      (SELECT COUNT(*) FROM newsletter)  AS total_newsletter
  `),

  getAllContacts: db.prepare(`
    SELECT id, name, email, type, message, created_at
    FROM contacts ORDER BY created_at DESC
  `),

  getAllWaitlist: db.prepare(`
    SELECT id, name, email, role, edition, created_at
    FROM waitlist ORDER BY created_at DESC
  `),
};

module.exports = { db, stmts };
