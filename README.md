# CoBuild — Website

> **"Where Ideas Find Builders"** — Community platform for makers, founders, and builders.

A full-stack **4-page website** built from the CoBuild Figma design. Node.js + Express backend with SQLite, served alongside a polished editorial-style frontend.

---

## Project Structure

```
cobuild/
├── public/                   ← 100% static frontend (works on any static host or Express)
│   ├── index.html            ← Home page
│   ├── community.html        ← Community page
│   ├── hackathons.html       ← CodeBuild 2.0 (24h hackathon at DTU + Unstop/WhatsApp channels)
│   ├── contact.html          ← Contact page (direct WhatsApp, Instagram, mailto & copy email)
│   ├── styles.css            ← Full design system stylesheet
│   └── main.js               ← Nav, scroll, animations, toast & click-to-copy email
│
├── server/                   ← Optional Express + SQLite backend server
│   ├── index.js              ← Express entry point
│   ├── mailer.js             ← Nodemailer (dev stub + production)
│   ├── routes/
│   │   ├── contact.js        ← POST /api/contact
│   │   ├── waitlist.js       ← POST /api/waitlist
│   │   ├── newsletter.js     ← POST /api/newsletter
│   │   └── stats.js          ← GET  /api/stats
│   └── db/
│       └── database.js       ← SQLite setup + prepared statements
│
├── package.json
├── .env.example              ← Copy to .env and fill in values
└── README.md
```

---

## Quick Start

### 1. Install dependencies

```bash
cd cobuild
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — set PORT, MAIL_* etc.
```

### 3. Run the server

```bash
# Development (auto-restart on file change)
npm run dev

# Production
npm start

# Run API & integration tests
npm test
```

Visit `http://localhost:3000`

---

## API Endpoints

All endpoints are under `/api/` and rate-limited.

| Method | Endpoint          | Description                                 |
|--------|-------------------|---------------------------------------------|
| `POST` | `/api/contact`    | Submit a contact form enquiry               |
| `POST` | `/api/waitlist`   | Join the CodeBuild 2.0 waitlist             |
| `POST` | `/api/newsletter` | Subscribe to email updates                  |
| `GET`  | `/api/stats`      | Public community stats (members, waitlist…) |
| `GET`  | `/api/health`     | Server health check                         |

### POST /api/contact

```json
{
  "name":    "Udit Agrawal",
  "email":   "udit@example.com",
  "type":    "general | partnership | hackathon | press | other",
  "message": "Hey, I'd love to partner with CoBuild!"
}
```

### POST /api/waitlist

```json
{
  "name":    "Harshit",
  "email":   "harshit@example.com",
  "role":    "developer | designer | founder | student | freelancer | other",
  "edition": "codebuild-2"
}
```

### POST /api/newsletter

```json
{ "email": "subscriber@example.com" }
```

---

## Design System

### Colour Palette (unchanged from Figma)

| Token         | Hex       | Role                         |
|---------------|-----------|------------------------------|
| `--bg`        | `#E8E2D5` | Warm off-white background    |
| `--bg-off`    | `#F0EBE0` | Slightly darker surface      |
| `--bg-dark`   | `#1A1A1A` | Dark sections                |
| `--amber`     | `#F0A500` | Brand accent — CTAs, badges  |
| `--black`     | `#1A1A1A` | Primary text                 |
| `--white`     | `#FFFFFF` | Card surfaces, note elements |

### Typography

| Role        | Font                     | Weights    |
|-------------|--------------------------|------------|
| Headlines   | Playfair Display (serif) | 400 – 700  |
| Body / UI   | Inter (sans-serif)       | 300 – 700  |

---

## Features

### Frontend
- **Sticky header** with backdrop blur + scroll-activated shadow
- **Mobile drawer nav** — full-screen, ESC-dismissible, aria-managed
- **Active secondary nav** — updates as you scroll via `IntersectionObserver`
- **Scroll-reveal animations** — staggered fade-up for cards and grids
- **Live stats** — `/api/stats` populates member/waitlist counts on the page
- **Toast notifications** — success/error feedback for form submissions
- **Working forms** — contact, waitlist, and newsletter, all wired to the API
- **Accessible** — semantic HTML5, ARIA roles, `sr-only`, `:focus-visible` styles
- **`prefers-reduced-motion`** respected — all animations disabled when set
- **Fully responsive** — breakpoints at 1024px, 768px, 480px

### Backend
- **Express** static file serving + REST API
- **SQLite** (better-sqlite3) — WAL mode, foreign keys, persistent storage
- **Input validation** — express-validator on all POST routes
- **Rate limiting** — 100 req/15min global, 5 form submissions/10min
- **Helmet** security headers
- **Nodemailer** — dev stub (logs to console), production email on `MAIL_ENABLED=true`
- **CORS** configured for dev (`*`) and production (specific domains)

---

## Email Setup

Set `MAIL_ENABLED=true` in `.env` to activate real email sending.

For Gmail:
1. Enable 2FA on your Google account
2. Generate an **App Password** at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Set `MAIL_USER=your@gmail.com` and `MAIL_PASS=your_app_password`

For other providers, change `MAIL_HOST` and `MAIL_PORT` accordingly.

---

## Deployment

### Railway / Render / Fly.io

```bash
# Set environment variables in the platform dashboard
# Then deploy from GitHub or via CLI
```

The server binds to `process.env.PORT` (defaults to `3000`).

### nginx reverse proxy (production)

```nginx
server {
  listen 80;
  server_name thecobuild.xyz www.thecobuild.xyz;

  location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

---

## Credits

**Design**: Udit Agrawal & Harshit — CoBuild team  
**Frontend**: HTML5, CSS custom properties, vanilla JS  
**Backend**: Node.js, Express, SQLite (better-sqlite3), Nodemailer  
**Icons**: Inline SVG (Lucide Icons subset, MIT licence)  
**Fonts**: Playfair Display + Inter via Google Fonts  

---

© 2026 CoBuild. Built by builders, for builders.
