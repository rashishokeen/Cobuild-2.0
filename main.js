/* ============================================================
   CoBuild — main.js
   Handles: nav, section tracking, scroll animations, stats
   ============================================================ */
'use strict';

(function () {

  /* ── Toast System ──────────────────────────────────────────── */
  window.showToast = function (message, type = 'info', duration = 4000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      container.setAttribute('role', 'status');
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `<span class="toast__icon" aria-hidden="true"></span><span>${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('is-visible'));
    });

    const dismiss = () => {
      toast.classList.add('is-leaving');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    };

    setTimeout(dismiss, duration);
    toast.addEventListener('click', dismiss);
  };

  /* ── Mobile Nav ────────────────────────────────────────────── */
  const toggle = document.querySelector('.nav-toggle');
  const drawer = document.querySelector('.nav-drawer');

  if (toggle && drawer) {
    const open = () => {
      toggle.classList.add('is-open');
      drawer.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close menu');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      toggle.classList.remove('is-open');
      drawer.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
    };

    toggle.addEventListener('click', () => {
      toggle.classList.contains('is-open') ? close() : open();
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) close();
    });

    // Close on nav link click
    drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  }

  /* ── Sticky Header Shadow ──────────────────────────────────── */
  const header = document.getElementById('site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Active Secondary Nav ──────────────────────────────────── */
  const secLinks = [...document.querySelectorAll('.sec-link')];
  const sections  = [...document.querySelectorAll('[data-section]')];

  if (secLinks.length && sections.length) {
    const setActive = (id) => {
      secLinks.forEach((l) => {
        const active = l.getAttribute('href') === `#${id}`;
        l.classList.toggle('is-active', active);
        if (active && l.scrollIntoView) {
          l.scrollIntoView({ inline: 'nearest', block: 'nearest' });
        }
      });
    };

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { threshold: 0.2, rootMargin: `-${header ? header.offsetHeight + 8 : 120}px 0px -40% 0px` }
    );

    sections.forEach((s) => obs.observe(s));
  }

  /* ── Smooth Anchor Scroll with Header Offset ───────────────── */
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const id = anchor.getAttribute('href').slice(1);
    if (!id) return;
    if (id === 'top') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const offset = header ? header.offsetHeight + 12 : 120;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Scroll Reveal ─────────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');

  if (revealEls.length) {
    if ('IntersectionObserver' in window && !prefersReduced) {
      const revealObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('is-visible');
              revealObs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
      );
      revealEls.forEach((el) => revealObs.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    }
  }

  /* ── Animated Counters (512K+ Impressions etc.) ────────────── */
  const countEls = document.querySelectorAll('[data-count]');
  if (countEls.length) {
    const animateCount = (el) => {
      if (el.dataset.counted) return;
      el.dataset.counted = '1';
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      if (Number.isNaN(target) || prefersReduced) {
        el.textContent = `${target}${suffix}`;
        return;
      }
      const duration = 1100;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);
        el.textContent = `${current}${suffix}`;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window && !prefersReduced) {
      const countObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              animateCount(e.target);
              countObs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.2 }
      );
      countEls.forEach((el) => countObs.observe(el));
    } else {
      countEls.forEach(animateCount);
    }
  }

  /* ── DTU 3D Wireframe Campus Showcase (ESYA-inspired) ──────── */
  const DTU_LANDMARKS = {
    overview: {
      meta: 'FIG. 01 · DTU CAMPUS',
      label: 'DTU · Delhi Technological University',
      info: '28.7499° N, 77.1174° E — Circular campus centered at OAT & CoBuild beacon.',
      yaw: 0.50, pitch: 0.54, zoom: 1.0, tx: 0, ty: 0,
    },
    oat: {
      meta: 'ZONE 01 · CENTRAL HUB',
      label: 'OAT · Open Air Theatre',
      info: 'Concentric semi-circular landmark at the heart of DTU, anchored by the CoBuild 2.0 beacon.',
      x: 0, y: 0, h: 16, pinLabel: 'OAT', elbowDx: 34, elbowDy: -22,
      yaw: 0.42, pitch: 0.48, zoom: 1.24, tx: 0, ty: 0,
    },
    arc: {
      meta: 'ZONE 02 · CONCENTRIC ARC',
      label: 'Circular Academic Arc',
      info: 'Radial crescent of academic buildings surrounding DTU’s central circular road network.',
      x: 22, y: -88, h: 48, pinLabel: 'ACADEMIC ARC', elbowDx: 30, elbowDy: -24,
      yaw: 0.25, pitch: 0.50, zoom: 1.18, tx: 18, ty: -62,
    },
    sports: {
      meta: 'ZONE 03 · EAST GROUND',
      label: 'Sports Complex',
      info: 'Eastern athletics oval and sports arena flanking the main campus loop.',
      x: 155, y: 20, h: 18, pinLabel: 'SPORTS COMPLEX', elbowDx: 22, elbowDy: -24,
      yaw: 0.92, pitch: 0.54, zoom: 1.18, tx: 120, ty: 15,
    },
    lake: {
      meta: 'ZONE 04 · WEST BASIN',
      label: 'Campus Lake',
      info: 'Western waterbody beside DTU’s outer circular green belt.',
      x: -145, y: 34, h: 10, pinLabel: 'CAMPUS LAKE', elbowDx: -24, elbowDy: -22,
      yaw: -0.35, pitch: 0.54, zoom: 1.18, tx: -115, ty: 24,
    },
    hostels: {
      meta: 'ZONE 05 · PERIMETER',
      label: 'Hostel & Perimeter Zone',
      info: 'North-western residential blocks arranged along the outer circular avenue.',
      x: -116, y: -96, h: 40, pinLabel: 'HOSTEL ZONE', elbowDx: -24, elbowDy: -24,
      yaw: -0.15, pitch: 0.48, zoom: 1.18, tx: -90, ty: -72,
    },
  };

  // Real-inspired DTU 3D massing (OAT semicircle, Academic crescent arc, Hostel blocks, Sports Complex, Campus Lake)
  const DTU_BUILDINGS = [
    { x: -72, y: -74, w: 36, d: 24, h: 38, zone: 'arc' },
    { x: -24, y: -96, w: 42, d: 26, h: 46, zone: 'arc' },
    { x: 30,  y: -92, w: 42, d: 26, h: 44, zone: 'arc' },
    { x: 80,  y: -66, w: 36, d: 24, h: 36, zone: 'arc' },
    { x: -46, y: -48, w: 28, d: 20, h: 28, zone: 'arc' },
    { x: 52,  y: -46, w: 28, d: 20, h: 30, zone: 'arc' },
    { x: 102, y: -22, w: 30, d: 24, h: 34, zone: 'arc' },
    { x: 96,  y: 44,  w: 32, d: 22, h: 28, zone: 'sports' },
    { x: -136, y: -112, w: 34, d: 22, h: 36, zone: 'hostels' },
    { x: -94,  y: -118, w: 32, d: 22, h: 38, zone: 'hostels' },
    { x: -146, y: -66,  w: 28, d: 26, h: 32, zone: 'hostels' },
    { x: -110, y: -32,  w: 26, d: 22, h: 26, zone: 'hostels' },
    { x: -58, y: 78, w: 32, d: 20, h: 24, zone: 'overview' },
    { x: 46,  y: 82, w: 34, d: 20, h: 26, zone: 'overview' },
  ];

  const DTU_ARCS = [
    { from: [-24, -96, 46],  to: [0, 0, 56], speed: 0.42, phase: 0.1 },
    { from: [155, 20, 8],    to: [0, 0, 56], speed: 0.36, phase: 0.45 },
    { from: [-116, -96, 36], to: [0, 0, 56], speed: 0.40, phase: 0.72 },
    { from: [80, -66, 36],   to: [0, 0, 56], speed: 0.33, phase: 0.90 },
  ];

  const DTU_PARTICLES = Array.from({ length: 34 }, (_, i) => ({
    x: Math.cos(i * 1.7) * (40 + (i % 7) * 28),
    y: Math.sin(i * 2.3) * (35 + (i % 6) * 24),
    z: 10 + (i % 9) * 14,
    s: 1 + (i % 3) * 0.7,
    speed: 0.15 + (i % 5) * 0.05,
  }));

  const cobuildBeaconLogo = new Image();
  cobuildBeaconLogo.src = 'cobuild-logo.png';

  function smoothstep(e0, e1, x) {
    const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  }

  /**
   * Mounts an interactive 3D wireframe DTU campus experience on a canvas.
   * Supports both the framed showcase (`stage`) and full-bleed awakening hero (`hero`).
   */
  function initDtuCampusCanvas(canvas, options) {
    if (!canvas || !canvas.getContext) return;
    const mode      = options.mode || 'stage';
    const container = canvas.closest(options.containerSelector);
    if (!container) return;

    const ctx       = canvas.getContext('2d');
    const hudMeta   = container.querySelector('.campus-hud-card__meta');
    const hudTitle  = container.querySelector('.campus-hud-card__title');
    const hudDesc   = container.querySelector('.campus-hud-card__desc');
    const chips     = [...container.querySelectorAll('[data-dtu-zone]')];
    const orbitBtn  = container.querySelector('[data-dtu-orbit]');
    const resetBtn  = container.querySelector('[data-dtu-reset]');
    const replayBtn = container.querySelector('[data-dtu-replay]');

    const baseLm = DTU_LANDMARKS.overview;
    const cam = {
      yaw: mode === 'hero' && !prefersReduced ? -0.58 : baseLm.yaw,
      pitch: mode === 'hero' && !prefersReduced ? 1.14 : baseLm.pitch,
      zoom: mode === 'hero' && !prefersReduced ? 0.45 : baseLm.zoom,
      tx: 0, ty: 0,
      tYaw: baseLm.yaw, tPitch: baseLm.pitch, tZoom: baseLm.zoom, tTx: 0, tTy: 0,
    };

    let activeZone     = 'overview';
    let autoOrbit      = !prefersReduced;
    let userInteracted = false;
    let isDragging     = false;
    let dragX = 0, dragY = 0;
    let inView         = false;
    let rafId          = null;
    let pinHits        = [];
    let awakeningStart = performance.now();
    const awakeDur     = mode === 'hero' ? 3200 : 1200;

    const triggerDraw = () => drawFrame(performance.now());

    const selectZone = (key) => {
      const lm = DTU_LANDMARKS[key] || DTU_LANDMARKS.overview;
      activeZone = key;
      userInteracted = true;
      cam.tYaw = lm.yaw;
      cam.tPitch = lm.pitch;
      cam.tZoom = lm.zoom;
      cam.tTx = lm.tx;
      cam.tTy = lm.ty;
      if (hudMeta)  hudMeta.textContent  = lm.meta;
      if (hudTitle) hudTitle.textContent = lm.label;
      if (hudDesc)  hudDesc.textContent  = lm.info;
      chips.forEach((c) => c.classList.toggle('is-active', c.dataset.dtuZone === key));
      if (prefersReduced) triggerDraw();
    };

    const replayAwakening = () => {
      awakeningStart = performance.now();
      userInteracted = false;
      activeZone = 'overview';
      cam.yaw = -0.58; cam.pitch = 1.14; cam.zoom = 0.45; cam.tx = 0; cam.ty = 0;
      cam.tYaw = baseLm.yaw; cam.tPitch = baseLm.pitch; cam.tZoom = baseLm.zoom; cam.tTx = 0; cam.tTy = 0;
      autoOrbit = !prefersReduced;
      if (orbitBtn) orbitBtn.classList.toggle('is-active', autoOrbit);
      if (hudMeta)  hudMeta.textContent  = baseLm.meta;
      if (hudTitle) hudTitle.textContent = baseLm.label;
      if (hudDesc)  hudDesc.textContent  = baseLm.info;
      chips.forEach((c) => c.classList.toggle('is-active', c.dataset.dtuZone === 'overview'));
      if (prefersReduced) triggerDraw();
    };

    chips.forEach((c) => c.addEventListener('click', () => {
      autoOrbit = false;
      if (orbitBtn) orbitBtn.classList.remove('is-active');
      selectZone(c.dataset.dtuZone);
    }));

    if (orbitBtn) {
      orbitBtn.classList.toggle('is-active', autoOrbit);
      orbitBtn.addEventListener('click', () => {
        autoOrbit = !autoOrbit;
        userInteracted = true;
        orbitBtn.classList.toggle('is-active', autoOrbit);
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        autoOrbit = !prefersReduced;
        if (orbitBtn) orbitBtn.classList.toggle('is-active', autoOrbit);
        selectZone('overview');
      });
    }
    if (replayBtn) {
      replayBtn.addEventListener('click', replayAwakening);
    }

    canvas.addEventListener('pointerdown', (e) => {
      isDragging = true;
      userInteracted = true;
      dragX = e.clientX;
      dragY = e.clientY;
    });
    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - dragX;
      const dy = e.clientY - dragY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        autoOrbit = false;
        if (orbitBtn) orbitBtn.classList.remove('is-active');
      }
      cam.tYaw += dx * 0.0065;
      cam.tPitch = Math.max(0.28, Math.min(0.88, cam.tPitch + dy * 0.004));
      dragX = e.clientX;
      dragY = e.clientY;
    });
    window.addEventListener('pointerup', () => { isDragging = false; });

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const hit = pinHits.find((p) => px >= p.x1 && px <= p.x2 && py >= p.y1 && py <= p.y2);
      if (hit) {
        autoOrbit = false;
        if (orbitBtn) orbitBtn.classList.remove('is-active');
        selectZone(hit.key);
      }
    });

    function getViewportOrigin(W, H) {
      if (mode === 'hero') {
        if (W > 1024) return { cx: W * 0.67, cy: H * 0.50, refSpan: Math.min(W * 0.56, H * 0.92) };
        return { cx: W * 0.50, cy: H * 0.67, refSpan: Math.min(W * 0.92, H * 0.48) };
      }
      return { cx: W * 0.50, cy: H * 0.53, refSpan: Math.min(W, H) };
    }

    function project(wx, wy, wz, W, H) {
      const x = wx - cam.tx;
      const y = wy - cam.ty;
      const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
      const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
      const rx = x * cy - y * sy;
      const ry = x * sy + y * cy;
      const origin = getViewportOrigin(W, H);
      const scaleBase = origin.refSpan * (W < 540 ? 0.0031 : 0.0029) * cam.zoom;
      const persp = 760 / (760 + ry * cp);
      return {
        x: origin.cx + rx * scaleBase * persp,
        y: origin.cy + (ry * sp - wz * cp) * scaleBase * persp,
        depth: ry,
      };
    }

    function drawOrbitalDome(W, H, domeAlpha, pAwake) {
      if (domeAlpha <= 0.02) return;
      ctx.save();
      const R = 215;
      // Longitude rings
      for (let i = 0; i < 4; i++) {
        const rot = i * (Math.PI / 4) + pAwake * 1.4;
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.12; a += 0.16) {
          const rx = Math.cos(a) * R * Math.cos(rot);
          const ry = Math.cos(a) * R * Math.sin(rot);
          const rz = Math.sin(a) * R * 0.65;
          const pt = project(rx, ry, rz, W, H);
          if (a === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = `rgba(240,165,0,${(domeAlpha * 0.45).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      // Equator scanner sweep
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.12; a += 0.14) {
        const pt = project(Math.cos(a) * R, Math.sin(a) * R, 0, W, H);
        if (a === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = `rgba(255,122,0,${(domeAlpha * 0.85).toFixed(3)})`;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.restore();
    }

    function drawBox(b, W, H, time, pAwake) {
      const distFrac = Math.hypot(b.x, b.y) / 185;
      const grow = mode === 'hero'
        ? smoothstep(0.24 + distFrac * 0.24, 0.54 + distFrac * 0.26, pAwake)
        : smoothstep(0.10 + distFrac * 0.20, 0.55 + distFrac * 0.25, pAwake);
      if (grow <= 0.02) return;

      const curH = b.h * grow;
      const x0 = b.x - b.w / 2, x1 = b.x + b.w / 2;
      const y0 = b.y - b.d / 2, y1 = b.y + b.d / 2;
      const bot = [
        project(x0, y0, 0, W, H), project(x1, y0, 0, W, H),
        project(x1, y1, 0, W, H), project(x0, y1, 0, W, H),
      ];
      const top = [
        project(x0, y0, curH, W, H), project(x1, y0, curH, W, H),
        project(x1, y1, curH, W, H), project(x0, y1, curH, W, H),
      ];
      const isLit = activeZone === b.zone || activeZone === 'overview';
      const edgeStroke = activeZone === b.zone
        ? '#FFC300'
        : isLit ? 'rgba(240,165,0,0.72)' : 'rgba(240,165,0,0.26)';
      const wallFill = activeZone === b.zone ? 'rgba(38,24,8,0.88)' : 'rgba(18,18,18,0.84)';
      const roofFill = activeZone === b.zone ? 'rgba(240,165,0,0.20)' : 'rgba(255,122,0,0.08)';

      for (let i = 0; i < 4; i++) {
        const j = (i + 1) % 4;
        ctx.beginPath();
        ctx.moveTo(bot[i].x, bot[i].y);
        ctx.lineTo(bot[j].x, bot[j].y);
        ctx.lineTo(top[j].x, top[j].y);
        ctx.lineTo(top[i].x, top[i].y);
        ctx.closePath();
        ctx.fillStyle = wallFill;
        ctx.fill();
        ctx.strokeStyle = edgeStroke;
        ctx.lineWidth = activeZone === b.zone ? 1.4 : 1;
        ctx.stroke();

        if (isLit && grow > 0.65) {
          const rows = curH > 30 ? 3 : 2;
          for (let r = 1; r <= rows; r++) {
            const zFrac = r / (rows + 1);
            for (let c = 0.28; c <= 0.75; c += 0.24) {
              const wx = x0 + (x1 - x0) * (i % 2 === 0 ? c : (i === 1 ? 1 : 0));
              const wy = y0 + (y1 - y0) * (i % 2 === 1 ? c : (i === 2 ? 1 : 0));
              const wp = project(wx, wy, curH * zFrac, W, H);
              const pulse = 0.45 + 0.55 * Math.sin(time * 0.002 + r * 2 + c * 9 + b.x);
              ctx.fillStyle = r === 1
                ? `rgba(240,165,0,${0.35 + pulse * 0.45})`
                : (c > 0.5 ? `rgba(255,122,0,${0.35 + pulse * 0.45})` : `rgba(232,226,213,${0.25 + pulse * 0.35})`);
              ctx.fillRect(wp.x - 1.4, wp.y - 1.4, 2.8, 2.8);
            }
          }
        }
      }

      ctx.beginPath();
      ctx.moveTo(top[0].x, top[0].y);
      ctx.lineTo(top[1].x, top[1].y);
      ctx.lineTo(top[2].x, top[2].y);
      ctx.lineTo(top[3].x, top[3].y);
      ctx.closePath();
      ctx.fillStyle = roofFill;
      ctx.fill();
      ctx.strokeStyle = activeZone === b.zone ? '#FFE082' : edgeStroke;
      ctx.stroke();
    }

    function drawFrame(now) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      if (!W || !H) return;
      if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const pAwake = prefersReduced ? 1 : Math.min(1, (now - awakeningStart) / awakeDur);

      if (mode === 'hero' && pAwake < 0.62 && !userInteracted) {
        const dive = smoothstep(0.05, 0.60, pAwake);
        cam.yaw   = -0.58 + (baseLm.yaw - (-0.58)) * dive;
        cam.pitch = 1.14 + (baseLm.pitch - 1.14) * dive;
        cam.zoom  = 0.45 + (baseLm.zoom - 0.45) * dive;
        cam.tYaw = cam.yaw; cam.tPitch = cam.pitch; cam.tZoom = cam.zoom;
      } else {
        if (autoOrbit && !isDragging) cam.tYaw += mode === 'hero' ? 0.0011 : 0.0018;
        cam.yaw   += (cam.tYaw - cam.yaw) * 0.08;
        cam.pitch += (cam.tPitch - cam.pitch) * 0.08;
        cam.zoom  += (cam.tZoom - cam.zoom) * 0.08;
        cam.tx    += (cam.tTx - cam.tx) * 0.08;
        cam.ty    += (cam.tTy - cam.ty) * 0.08;
      }

      // 1. Perspective blueprint ground grid
      const gridAlpha = 0.06 * smoothstep(0.05, 0.35, pAwake);
      if (gridAlpha > 0.002) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(240,165,0,${gridAlpha.toFixed(3)})`;
        for (let g = -240; g <= 240; g += 40) {
          const p1 = project(g, -200, 0, W, H), p2 = project(g, 200, 0, W, H);
          ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
          const q1 = project(-240, g * 0.8, 0, W, H), q2 = project(240, g * 0.8, 0, W, H);
          ctx.beginPath(); ctx.moveTo(q1.x, q1.y); ctx.lineTo(q2.x, q2.y); ctx.stroke();
        }
      }

      // 2. Hero Orbital Wireframe Radar Dome (fades cleanly into campus plane)
      if (mode === 'hero' && pAwake < 0.7) {
        drawOrbitalDome(W, H, (1 - smoothstep(0.28, 0.68, pAwake)) * 0.65, pAwake);
      }

      // 3. DTU Circular Road Rings & Entrance Avenue
      const roadFade = smoothstep(0.14, 0.48, pAwake);
      if (roadFade > 0.01) {
        ctx.save();
        ctx.globalAlpha = roadFade;
        [62, 118, 178].forEach((radius, idx) => {
          ctx.beginPath();
          for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.14) {
            const pt = project(Math.cos(a) * radius, Math.sin(a) * radius * 0.84, 0, W, H);
            if (a === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
          }
          ctx.strokeStyle = idx === 1 ? 'rgba(255,122,0,0.75)' : 'rgba(240,165,0,0.34)';
          ctx.lineWidth = idx === 1 ? 2.2 : 1.2;
          ctx.stroke();
        });

        ctx.beginPath();
        for (let x = -210; x <= 210; x += 20) {
          const pt = project(x, 128 + Math.sin(x * 0.015) * 14, 0, W, H);
          if (x === -210) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = 'rgba(232,226,213,0.42)';
        ctx.lineWidth = 2.4;
        ctx.stroke();

        // Western Campus Lake & Eastern Sports Complex oval
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.2; a += 0.22) {
          const pt = project(-145 + Math.cos(a) * 34, 34 + Math.sin(a) * 22, 0, W, H);
          if (a === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
        }
        ctx.fillStyle = activeZone === 'lake' ? 'rgba(240,165,0,0.22)' : 'rgba(232,226,213,0.08)';
        ctx.fill();
        ctx.strokeStyle = activeZone === 'lake' ? '#FFC300' : 'rgba(232,226,213,0.45)';
        ctx.lineWidth = 1.4;
        ctx.stroke();

        [28, 20].forEach((r, ri) => {
          ctx.beginPath();
          for (let a = 0; a <= Math.PI * 2 + 0.2; a += 0.2) {
            const pt = project(155 + Math.cos(a) * r, 20 + Math.sin(a) * (r * 1.35), 0, W, H);
            if (a === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
          }
          ctx.fillStyle = ri === 0 ? (activeZone === 'sports' ? 'rgba(255,122,0,0.24)' : 'rgba(255,122,0,0.1)') : 'rgba(16,16,16,0.6)';
          ctx.fill();
          ctx.strokeStyle = activeZone === 'sports' ? '#FFC300' : '#FF7A00';
          ctx.lineWidth = 1.4;
          ctx.stroke();
        });

        // Central OAT tiered semicircle
        [34, 24, 14].forEach((rad, ti) => {
          ctx.beginPath();
          for (let a = -Math.PI * 0.9; a <= Math.PI * 0.1; a += 0.18) {
            const pt = project(Math.cos(a) * rad, Math.sin(a) * rad * 0.88, ti * 3.5, W, H);
            if (a === -Math.PI * 0.9) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
          }
          ctx.strokeStyle = ti === 0 ? '#FF7A00' : '#F0A500';
          ctx.lineWidth = 2.1;
          ctx.stroke();
        });
        ctx.restore();
      }

      // 4. Depth-sorted 3D buildings with staggered extrusion
      DTU_BUILDINGS
        .map((b) => ({ ...b, depth: project(b.x, b.y, 0, W, H).depth }))
        .sort((a, b) => b.depth - a.depth)
        .forEach((b) => drawBox(b, W, H, now, pAwake));

      // 5. Central Vertical Beacon Light Beam + Floating CoBuild Logo Medallion
      const beamGrow = smoothstep(0.32, 0.68, pAwake);
      if (beamGrow > 0.02) {
        const basePt = project(0, 0, 2, W, H);
        const bob = prefersReduced ? 0 : Math.sin(now * 0.0022) * 5;
        const topPt = project(0, 0, 142 * beamGrow, W, H);
        const beamGrad = ctx.createLinearGradient(basePt.x, basePt.y, topPt.x, topPt.y);
        beamGrad.addColorStop(0, 'rgba(255,245,214,0.95)');
        beamGrad.addColorStop(0.35, 'rgba(240,165,0,0.65)');
        beamGrad.addColorStop(0.75, 'rgba(255,122,0,0.22)');
        beamGrad.addColorStop(1, 'rgba(255,122,0,0)');

        ctx.save();
        ctx.strokeStyle = beamGrad;
        ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(basePt.x, basePt.y); ctx.lineTo(topPt.x, topPt.y); ctx.stroke();
        ctx.lineWidth = 22;
        ctx.globalAlpha = 0.18;
        ctx.beginPath(); ctx.moveTo(basePt.x, basePt.y); ctx.lineTo(topPt.x, topPt.y); ctx.stroke();
        ctx.restore();

        const logoAlpha = smoothstep(0.42, 0.72, pAwake);
        if (logoAlpha > 0.02) {
          const logoPt = project(0, 0, 70 + bob, W, H);
          const haloR = 32;
          const halo = ctx.createRadialGradient(logoPt.x, logoPt.y, 4, logoPt.x, logoPt.y, haloR);
          halo.addColorStop(0, `rgba(240,165,0,${(0.48 * logoAlpha).toFixed(3)})`);
          halo.addColorStop(1, 'rgba(240,165,0,0)');
          ctx.fillStyle = halo;
          ctx.beginPath(); ctx.arc(logoPt.x, logoPt.y, haloR, 0, Math.PI * 2); ctx.fill();

          ctx.save();
          ctx.globalAlpha = logoAlpha;
          ctx.beginPath();
          ctx.arc(logoPt.x, logoPt.y, 22, 0, Math.PI * 2);
          ctx.fillStyle = '#FAF8F4';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = '#FF7A00';
          ctx.stroke();
          if (cobuildBeaconLogo.complete && cobuildBeaconLogo.naturalWidth > 0) {
            const lw = 32;
            const lh = lw * (cobuildBeaconLogo.naturalHeight / cobuildBeaconLogo.naturalWidth);
            ctx.drawImage(cobuildBeaconLogo, logoPt.x - lw / 2, logoPt.y - lh / 2, lw, lh);
          } else {
            ctx.fillStyle = '#F0A500';
            ctx.beginPath(); ctx.arc(logoPt.x, logoPt.y, 8, 0, Math.PI * 2); ctx.fill();
          }
          ctx.restore();
        }
      }

      // 6. Luminous Signal Arcs + Particles (visible once extruded)
      const fxAlpha = smoothstep(0.55, 0.90, pAwake);
      if (fxAlpha > 0.02) {
        ctx.save();
        ctx.globalAlpha = fxAlpha;
        DTU_ARCS.forEach((arc) => {
          const steps = 22;
          ctx.beginPath();
          for (let s = 0; s <= steps; s++) {
            const t = s / steps;
            const ax = arc.from[0] + (arc.to[0] - arc.from[0]) * t;
            const ay = arc.from[1] + (arc.to[1] - arc.from[1]) * t;
            const az = arc.from[2] + (arc.to[2] - arc.from[2]) * t + Math.sin(t * Math.PI) * 52;
            const p = project(ax, ay, az, W, H);
            if (s === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
          }
          ctx.strokeStyle = 'rgba(240,165,0,0.32)';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          if (!prefersReduced) {
            const ptT = ((now * 0.00032 * arc.speed * 2 + arc.phase) % 1);
            const px = arc.from[0] + (arc.to[0] - arc.from[0]) * ptT;
            const py = arc.from[1] + (arc.to[1] - arc.from[1]) * ptT;
            const pz = arc.from[2] + (arc.to[2] - arc.from[2]) * ptT + Math.sin(ptT * Math.PI) * 52;
            const dot = project(px, py, pz, W, H);
            ctx.fillStyle = '#FFE082';
            ctx.beginPath(); ctx.arc(dot.x, dot.y, 2.8, 0, Math.PI * 2); ctx.fill();
          }
        });

        DTU_PARTICLES.forEach((pt, idx) => {
          const drift = prefersReduced ? 0 : ((now * 0.008 * pt.speed + idx * 9) % 45);
          const p = project(pt.x, pt.y, pt.z + drift, W, H);
          ctx.fillStyle = idx % 2 === 0 ? 'rgba(240,165,0,0.45)' : 'rgba(232,226,213,0.3)';
          ctx.fillRect(p.x, p.y, pt.s, pt.s);
        });
        ctx.restore();
      }

      // 7. Landmark Callouts ('elbow' architectural leaders on hero; pill pins on stage)
      const callAlpha = mode === 'hero' ? smoothstep(0.68, 0.96, pAwake) : 1;
      pinHits = [];
      if (callAlpha > 0.05) {
        ctx.save();
        ctx.globalAlpha = callAlpha;
        ['oat', 'arc', 'sports', 'lake', 'hostels'].forEach((key) => {
          const lm = DTU_LANDMARKS[key];
          const anchor = project(lm.x, lm.y, lm.h, W, H);
          const selected = activeZone === key;

          if (mode === 'hero') {
            ctx.font = '600 10px ui-monospace, SFMono-Regular, Menlo, monospace';
            const tw = ctx.measureText(lm.pinLabel).width;
            const dir = anchor.x < getViewportOrigin(W, H).cx ? -1 : 1;
            const ex = Math.max(16 + tw, Math.min(W - tw - 20, anchor.x + dir * 24));
            const ey = Math.max(54, anchor.y + (lm.elbowDy || -22));
            const endX = dir > 0 ? Math.min(W - 14, ex + tw + 8) : Math.max(14, ex - tw - 8);

            // Anchor dot
            ctx.fillStyle = selected ? '#FFC300' : '#FF7A00';
            ctx.beginPath(); ctx.arc(anchor.x, anchor.y, 2.6, 0, Math.PI * 2); ctx.fill();

            // Elbow leader & shelf underline
            ctx.strokeStyle = selected ? '#FFC300' : 'rgba(240,165,0,0.65)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(anchor.x, anchor.y);
            ctx.lineTo(ex, ey);
            ctx.lineTo(endX, ey);
            ctx.stroke();

            const tx = dir > 0 ? ex + 4 : endX + 4;
            ctx.fillStyle = selected ? '#FFC300' : '#E8E2D5';
            ctx.fillText(lm.pinLabel, tx, ey - 5);
            pinHits.push({ key, x1: Math.min(ex, endX) - 4, y1: ey - 20, x2: Math.max(ex, endX) + 4, y2: ey + 6 });
          } else {
            ctx.font = '600 10px Inter, sans-serif';
            const tw = ctx.measureText(lm.pinLabel).width;
            const bw = tw + 16, bh = 20;
            const bx = Math.max(12, Math.min(W - bw - 12, anchor.x - bw / 2));
            const by = Math.max(52, anchor.y - 22 - bh);

            ctx.strokeStyle = selected ? '#FFC300' : 'rgba(240,165,0,0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(anchor.x, anchor.y); ctx.lineTo(bx + bw / 2, by + bh); ctx.stroke();

            ctx.fillStyle = selected ? '#F0A500' : 'rgba(14,14,14,0.88)';
            ctx.strokeStyle = selected ? '#FFE082' : 'rgba(240,165,0,0.55)';
            ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 4); ctx.fill(); ctx.stroke();

            ctx.fillStyle = selected ? '#1A1A1A' : '#E8E2D5';
            ctx.fillText(lm.pinLabel, bx + 8, by + 13.5);
            pinHits.push({ key, x1: bx, y1: by, x2: bx + bw, y2: by + bh });
          }
        });
        ctx.restore();
      }
    }

    const loop = (now) => {
      if (!inView || prefersReduced) { rafId = null; return; }
      drawFrame(now);
      rafId = requestAnimationFrame(loop);
    };

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          inView = entry.isIntersecting;
          if (inView && !prefersReduced && !rafId) {
            rafId = requestAnimationFrame(loop);
          }
        });
      }, { threshold: 0.05 });
      obs.observe(container);
    } else {
      inView = true;
      if (!prefersReduced) rafId = requestAnimationFrame(loop);
    }

    triggerDraw();
    window.addEventListener('resize', triggerDraw, { passive: true });
  }

  initDtuCampusCanvas(document.getElementById('dtu-campus-canvas'), { mode: 'stage', containerSelector: '.campus-stage' });
  initDtuCampusCanvas(document.getElementById('hack-campus-canvas'), { mode: 'hero',  containerSelector: '.hack-hero' });

  /* ── Shared Dark Section Ambient Constellation Animation ───── */
  function initDarkAmbientCanvas(section) {
    if (!section) return;
    let canvas = section.querySelector('.contact-ambient-canvas, .dark-ambient-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'dark-ambient-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      section.insertBefore(canvas, section.firstChild);
    }
    if (!canvas.getContext) return;

    const ctx = canvas.getContext('2d');
    const nodes = Array.from({ length: 24 }, (_, i) => ({
      x: (i * 0.37) % 1,
      y: (i * 0.61) % 1,
      vx: Math.cos(i * 1.9) * 0.00014,
      vy: Math.sin(i * 2.3) * 0.00014,
      r: 1.2 + (i % 3) * 0.65,
      amber: i % 3 !== 2,
    }));
    const pointer = { x: -999, y: -999, active: false };
    let visible = false, raf = null;

    section.addEventListener('pointermove', (e) => {
      const rect = section.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    }, { passive: true });
    section.addEventListener('pointerleave', () => { pointer.active = false; });

    function render(now) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = canvas.clientWidth, H = canvas.clientHeight;
      if (!W || !H) return;
      if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      const isContact = section.classList.contains('contact-section');
      const cx = isContact ? (W < 768 ? W * 0.5 : W * 0.22) : (W < 768 ? W * 0.5 : W * 0.80);
      const cy = isContact ? (W < 768 ? H * 0.16 : H * 0.30) : H * 0.36;
      const breath = prefersReduced ? 0 : Math.sin(now * 0.0012) * 10;
      [140, 220, 310].forEach((baseR, idx) => {
        ctx.beginPath();
        ctx.arc(cx, cy, baseR + breath * (idx + 1) * 0.35, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 0 ? 'rgba(255,122,0,0.14)' : 'rgba(240,165,0,0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      const pts = nodes.map((n) => {
        if (!prefersReduced) {
          n.x = (n.x + n.vx + 1) % 1;
          n.y = (n.y + n.vy + 1) % 1;
        }
        return { px: n.x * W, py: n.y * H, r: n.r, amber: n.amber };
      });

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].px - pts[j].px;
          const dy = pts[i].py - pts[j].py;
          const d = Math.hypot(dx, dy);
          if (d < 170) {
            ctx.strokeStyle = `rgba(240,165,0,${((1 - d / 170) * 0.12).toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(pts[i].px, pts[i].py); ctx.lineTo(pts[j].px, pts[j].py); ctx.stroke();
          }
        }
        if (pointer.active && !prefersReduced) {
          const d = Math.hypot(pts[i].px - pointer.x, pts[i].py - pointer.y);
          if (d < 190) {
            ctx.strokeStyle = `rgba(255,122,0,${((1 - d / 190) * 0.28).toFixed(3)})`;
            ctx.beginPath(); ctx.moveTo(pts[i].px, pts[i].py); ctx.lineTo(pointer.x, pointer.y); ctx.stroke();
          }
        }
        ctx.fillStyle = pts[i].amber ? 'rgba(240,165,0,0.48)' : 'rgba(232,226,213,0.28)';
        ctx.beginPath(); ctx.arc(pts[i].px, pts[i].py, pts[i].r, 0, Math.PI * 2); ctx.fill();
      }
    }

    const tick = (now) => {
      if (!visible || prefersReduced) { raf = null; return; }
      render(now);
      raf = requestAnimationFrame(tick);
    };

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          visible = e.isIntersecting;
          if (visible && !prefersReduced && !raf) raf = requestAnimationFrame(tick);
        });
      }, { threshold: 0.05 }).observe(section);
    } else {
      visible = true;
      if (!prefersReduced) raf = requestAnimationFrame(tick);
    }

    render(performance.now());
    window.addEventListener('resize', () => render(performance.now()), { passive: true });
  }

  document.querySelectorAll('.contact-section, .inside-section').forEach(initDarkAmbientCanvas);

  /* ── Click-to-Copy Helpers ─────────────────────────────────── */
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-copy');
      if (!text) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          () => window.showToast(`Copied ${text} to clipboard`, 'success'),
          () => window.showToast(`Email: ${text}`, 'info')
        );
      } else {
        window.showToast(`Email: ${text}`, 'info');
      }
    });
  });

})();
