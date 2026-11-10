'use strict';

const http = require('http');

async function runTests() {
  // Set test port
  process.env.PORT = '3001';
  process.env.NODE_ENV = 'test';
  process.env.MAIL_ENABLED = 'false';

  // Import app (which will listen on PORT)
  const app = require('./server/index.js');

  // Wait a brief moment for server to bind
  await new Promise((r) => setTimeout(r, 500));

  const base = 'http://127.0.0.1:3001';
  let passed = 0;
  let failed = 0;

  async function check(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (e) {
      console.error(`  ❌ FAIL: ${name} ->`, e.message);
      failed++;
    }
  }

  console.log('\n--- Running CoBuild API & Static Tests ---\n');

  await check('GET /api/health', async () => {
    const res = await fetch(`${base}/api/health`);
    const data = await res.json();
    if (res.status !== 200 || data.status !== 'ok') throw new Error(`Health failed: ${JSON.stringify(data)}`);
  });

  await check('GET /api/stats', async () => {
    const res = await fetch(`${base}/api/stats`);
    const data = await res.json();
    if (res.status !== 200 || !data.success || !data.data) throw new Error(`Stats failed: ${JSON.stringify(data)}`);
    console.log('     Stats data:', JSON.stringify(data.data));
  });

  const uniqueEmail = `builder_${Date.now()}@example.com`;

  await check('POST /api/contact (valid)', async () => {
    const res = await fetch(`${base}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rashi Test',
        email: uniqueEmail,
        type: 'partnership',
        message: 'Hello, looking forward to partnering with CoBuild!',
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.success) throw new Error(`Contact failed (${res.status}): ${JSON.stringify(data)}`);
  });

  await check('POST /api/waitlist (new)', async () => {
    const res = await fetch(`${base}/api/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alex Builder',
        email: uniqueEmail,
        role: 'developer',
        edition: 'codebuild-2',
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.success) throw new Error(`Waitlist failed (${res.status}): ${JSON.stringify(data)}`);
  });

  await check('POST /api/waitlist (duplicate handling)', async () => {
    const res = await fetch(`${base}/api/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alex Builder',
        email: uniqueEmail,
        role: 'developer',
        edition: 'codebuild-2',
      }),
    });
    const data = await res.json();
    if (res.status !== 200 || !data.duplicate) throw new Error(`Waitlist duplicate failed (${res.status}): ${JSON.stringify(data)}`);
  });

  await check('POST /api/newsletter (new)', async () => {
    const res = await fetch(`${base}/api/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.success) throw new Error(`Newsletter failed (${res.status}): ${JSON.stringify(data)}`);
  });

  await check('POST /api/newsletter (duplicate handling)', async () => {
    const res = await fetch(`${base}/api/newsletter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: uniqueEmail,
      }),
    });
    const data = await res.json();
    if (res.status !== 200 || !data.duplicate) throw new Error(`Newsletter duplicate failed (${res.status}): ${JSON.stringify(data)}`);
  });

  await check('GET / (marquee, dark DTU 3D campus, official CoBuild logo, bottom sponsors, CodeBuild 1.0 512K+ counter)', async () => {
    const res = await fetch(`${base}/`);
    const text = await res.text();
    const ok = text.includes('CodeBuild 2.0 is Live') &&
      text.includes('cobuild-logo.png') &&
      text.includes('redhawk.png') &&
      text.includes('CURRENT SPONSORS') &&
      text.includes('MEDIA PARTNER') &&
      text.includes('Eventopia') &&
      text.includes('PREVIOUS SPONSORS') &&
      text.includes('Goibibo') &&
      text.includes('CodeBuild 1.0 Impressions') &&
      text.includes('dtu-campus-canvas') &&
      text.includes('campus-brand-pill') &&
      text.includes('DTU') &&
      text.indexOf('id="campus"') > -1 &&
      text.indexOf('id="campus"') < text.indexOf('id="join"') &&
      text.indexOf('id="join"') < text.indexOf('id="partners"');
    const hasStale = text.includes('259K+') ||
      text.includes('<form') ||
      text.includes('IGDTUW') ||
      text.includes('Logo TBA') ||
      text.includes('assets/logos/') ||
      text.includes('logo__sq') ||
      /\b(Top 200|Expected|Confirmed)\b/i.test(text);
    if (res.status !== 200 || !ok || hasStale) {
      throw new Error('Home page failed verification');
    }
  });

  await check('GET /community.html (milestones panel, no Active members table, 512K+ meta, no backend forms)', async () => {
    const res = await fetch(`${base}/community.html`);
    const text = await res.text();
    const hasStale = text.includes('Active members') || text.includes('Projects started') || text.includes('City chapters') || text.includes('<form');
    if (res.status !== 200 || !text.includes('Community') || !text.includes('512K+ Impressions') || !text.includes('CodeBuild 1.0') || hasStale) {
      throw new Error('Community page failed verification');
    }
  });

  await check('GET /hackathons.html (512K+, no Top 200/Expected/Confirmed, no breakdown card, bottom sponsors)', async () => {
    const res = await fetch(`${base}/hackathons.html`);
    const text = await res.text();
    const hasReal = text.includes('CodeBuild 2.0') &&
      text.includes('Neural Ai') &&
      text.includes('SkillOP') &&
      text.includes('hack-campus-canvas') &&
      text.includes('512K+ Impressions') &&
      text.includes('CURRENT SPONSORS') &&
      text.includes('MEDIA PARTNER') &&
      text.includes('PREVIOUS SPONSORS') &&
      text.includes('3,387') &&
      text.indexOf('id="past"') > -1 &&
      text.indexOf('id="past"') < text.indexOf('id="sponsors"');
    const hasStale = text.includes('WINNER PRIZE BREAKDOWN') ||
      text.includes('259K+') ||
      text.includes('hack-hero__footer') ||
      text.includes('Replay Awakening') ||
      /\b(Top 200|Expected|Confirmed)\b/i.test(text) ||
      text.includes('1L+') ||
      text.includes('48h') ||
      text.includes('<form');
    if (res.status !== 200 || !hasReal || hasStale) {
      throw new Error('Hackathons page failed verification');
    }
  });

  await check('GET /contact.html (merged direct channels & contacts, no member table, 512K+ meta)', async () => {
    const res = await fetch(`${base}/contact.html`);
    const text = await res.text();
    const hasStale = text.includes('id="connect"') || text.includes('Projects Started') || text.includes('Coming soon') || text.includes('<form');
    if (res.status !== 200 || !text.includes('hear from you') || !text.includes('Partnerships &amp; Sponsors') || !text.includes('Udit Agrawal') || !text.includes('512K+ Impressions') || !text.includes('data-copy=') || hasStale) {
      throw new Error('Contact page failed verification');
    }
  });

  console.log(`\n--- Results: ${passed} passed, ${failed} failed ---\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
