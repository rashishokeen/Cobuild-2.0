/* ============================================================
   CoBuild — Shared Motion, Micro-Interactions & UX Polish
   Vanilla JS + IntersectionObserver + Web Animations API
   Disable globally: window.COBUILD_ANIMATIONS = false
   or add class "no-animations" to <html>.
   ============================================================ */

(() => {
  'use strict';

  const root = document.documentElement;
  if (window.COBUILD_ANIMATIONS === false || root.classList.contains('no-animations')) return;

  const prefersReduced = Boolean(
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const canHover = Boolean(
    window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches
  );

  const FLAGS = Object.assign(
    {
      progressBar: true,
      loader: true,
      pageTransitions: true,
      scrollspyFix: true,
      heroReveal: true,
      countdown: true,
      spotlight: true,
      parallaxNotes: true,
      marqueeBoost: true,
      staggeredReveals: true,
      statCounters: true,
      cardTiltGlow: true,
      roleChips: true,
      sponsorMarquees: true,
      buttonFx: true,
      mobileBar: true,
    },
    window.COBUILD_MOTION_FLAGS || {}
  );

  /* ── 1. First-Visit Logo Reveal Loader (< 1s, non-blocking) ── */
  let loaderDelayMs = 40;
  if (FLAGS.loader && !prefersReduced && document.body) {
    let seen = false;
    try {
      seen = sessionStorage.getItem('cb_loader_seen') === '1';
      if (!seen) sessionStorage.setItem('cb_loader_seen', '1');
    } catch {
      seen = false;
    }

    if (!seen) {
      loaderDelayMs = 560;
      const loader = document.createElement('div');
      loader.className = 'cb-loader';
      loader.setAttribute('aria-hidden', 'true');
      loader.innerHTML =
        '<img class="cb-loader__logo" src="cobuild-logo.png" alt="" />' +
        '<div class="cb-loader__bar"><div class="cb-loader__fill"></div></div>';
      document.body.prepend(loader);

      const dismissLoader = () => {
        if (loader.classList.contains('is-done')) return;
        loader.classList.add('is-done');
        window.setTimeout(() => loader.remove(), 380);
      };

      window.setTimeout(dismissLoader, 580);
      window.setTimeout(dismissLoader, 1050);
    }
  }

  /* ── 2. View Transitions MPA Fallback & bfcache Reset ──────── */
  if (FLAGS.pageTransitions) {
    window.addEventListener('pageshow', () => {
      root.classList.remove('cb-page-leaving');
    });

    const supportsNativeViewTransition = 'onpageswap' in window;
    if (!prefersReduced && !supportsNativeViewTransition) {
      document.addEventListener('click', (e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const link = e.target.closest('a[href]');
        if (!link) return;
        if (link.target && link.target !== '_self') return;
        const href = link.getAttribute('href') || '';
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http')) return;
        e.preventDefault();
        root.classList.add('cb-page-leaving');
        window.setTimeout(() => {
          window.location.href = link.href;
        }, 150);
      });
    }
  }

  /* ── 3. Top Amber Scroll Progress Bar ──────────────────────── */
  let progressBar = null;
  if (FLAGS.progressBar && !prefersReduced && document.body) {
    progressBar = document.createElement('div');
    progressBar.className = 'cb-scroll-progress';
    progressBar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progressBar);
  }

  /* ── 4. Countdown Chip to 16 Nov 2026 (IST) ────────────────── */
  if (FLAGS.countdown) {
    const countdownEls = [...document.querySelectorAll('[data-countdown]')];
    const updateCountdowns = () => {
      const now = Date.now();
      countdownEls.forEach((el) => {
        const targetStr = el.getAttribute('data-countdown') || '2026-11-16T00:00:00+05:30';
        const targetMs = Date.parse(targetStr);
        const textNode = el.querySelector('.cb-countdown-chip__text') || el;
        if (Number.isNaN(targetMs)) return;
        const diff = targetMs - now;
        if (diff <= 0) {
          textNode.textContent = 'Round 1 is live';
          el.classList.add('is-live');
          return;
        }
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        textNode.textContent = `Round 1 opens in ${days}d ${hours}h ${mins}m`;
      });
    };
    if (countdownEls.length) {
      updateCountdowns();
      window.setInterval(updateCountdowns, 15000);
    }
  }

  /* ── 5. Hero Word-by-Word Reveal & Italic Underline ────────── */
  if (FLAGS.heroReveal) {
    const heroHeadings = [...document.querySelectorAll('.hero__heading, .hack-hero h1, #comm-overview h1')];
    heroHeadings.forEach((heading) => {
      if (prefersReduced) {
        heading.querySelectorAll('em').forEach((em) => em.classList.add('cb-em-line'));
        heading.classList.add('cb-words-ready');
        return;
      }

      let wordIndex = 0;
      const splitNodeWords = (textNode) => {
        const frag = document.createDocumentFragment();
        const parts = textNode.nodeValue.split(/(\s+)/);
        parts.forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
          } else {
            const mask = document.createElement('span');
            mask.className = 'cb-word-mask';
            const word = document.createElement('span');
            word.className = 'cb-word';
            word.style.setProperty('--wi', String(wordIndex++));
            word.textContent = part;
            mask.appendChild(word);
            frag.appendChild(mask);
          }
        });
        return frag;
      };

      const walk = (container) => {
        [...container.childNodes].forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            if (node.nodeValue && node.nodeValue.trim()) {
              container.replaceChild(splitNodeWords(node), node);
            }
          } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'EM') {
            node.classList.add('cb-em-line');
            walk(node);
          } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR') {
            walk(node);
          }
        });
      };

      walk(heading);
      window.setTimeout(() => {
        requestAnimationFrame(() => heading.classList.add('cb-words-ready'));
      }, loaderDelayMs);
    });
  }

  /* ── 6. Desktop-Only Hero Cursor Spotlight ─────────────────── */
  if (FLAGS.spotlight && canHover && !prefersReduced) {
    document.querySelectorAll('.hero, .hack-hero').forEach((heroEl) => {
      const spot = document.createElement('div');
      spot.className = 'cb-hero-spotlight';
      spot.setAttribute('aria-hidden', 'true');
      heroEl.prepend(spot);

      let targetX = 0, targetY = 0, curX = 0, curY = 0, raf = null, active = false;

      const tick = () => {
        curX += (targetX - curX) * 0.16;
        curY += (targetY - curY) * 0.16;
        spot.style.transform = `translate3d(${curX.toFixed(1)}px, ${curY.toFixed(1)}px, 0)`;
        if (active || Math.abs(targetX - curX) > 0.5 || Math.abs(targetY - curY) > 0.5) {
          raf = requestAnimationFrame(tick);
        } else {
          raf = null;
        }
      };

      heroEl.addEventListener('pointermove', (e) => {
        const rect = heroEl.getBoundingClientRect();
        targetX = e.clientX - rect.left;
        targetY = e.clientY - rect.top;
        if (!active) {
          curX = targetX;
          curY = targetY;
          active = true;
          spot.classList.add('is-active');
        }
        if (!raf) raf = requestAnimationFrame(tick);
      }, { passive: true });

      heroEl.addEventListener('pointerleave', () => {
        active = false;
        spot.classList.remove('is-active');
      });
    });
  }

  /* ── 7. Staggered Scroll Reveals & Bottom Scrollspy Edge ───── */
  if (FLAGS.staggeredReveals) {
    const staggerGroups = [
      '.section-header > .reveal',
      '.features-grid > .feature-card',
      '.inside-grid > .inside-item',
      '.people-tags > .people-tag',
      '.timeline-grid > .timeline-card',
      '.hack-stats > .hack-stat',
      '.event-meta-grid > .event-meta-cell',
      '.sponsor-grid--current > .sponsor-card',
      '.sponsor-grid--previous > .sponsor-card',
    ];
    staggerGroups.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el, idx) => {
        if (!el.classList.contains('reveal')) el.classList.add('reveal');
        el.style.setProperty('--cb-delay', `${(idx % 6) * 75}ms`);
      });
    });

    const newRevealCandidates = [...document.querySelectorAll('.reveal:not(.is-visible)')];
    if (newRevealCandidates.length) {
      if ('IntersectionObserver' in window && !prefersReduced) {
        const obs = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
        );
        newRevealCandidates.forEach((el) => obs.observe(el));
      } else {
        newRevealCandidates.forEach((el) => el.classList.add('is-visible'));
      }
    }
  }

  /* ── 8. Eased Count-Up Animations for Exact Text Metrics ───── */
  if (FLAGS.statCounters) {
    const parseStatSpec = (text) => {
      const clean = text.trim();
      if (clean === '2–4' || clean === '2-4') {
        const sep = clean.includes('–') ? '–' : '-';
        return {
          finalText: clean,
          format: (t) => {
            if (t >= 1) return clean;
            const lo = Math.min(2, Math.max(1, Math.round(t * 2)));
            const hi = Math.max(lo, Math.round(t * 4));
            return `${lo}${sep}${hi}`;
          },
        };
      }
      const lakhMatch = clean.match(/^₹\s*([\d.]+)\s*Lakh$/i);
      if (lakhMatch) {
        const num = parseFloat(lakhMatch[1]);
        const decimals = lakhMatch[1].includes('.') ? 1 : 0;
        return {
          finalText: clean,
          format: (t) => (t >= 1 ? clean : `₹${(num * t).toFixed(decimals)} Lakh`),
        };
      }
      const hourMatch = clean.match(/^(\d+)h$/i);
      if (hourMatch) {
        const num = parseInt(hourMatch[1], 10);
        return {
          finalText: clean,
          format: (t) => (t >= 1 ? clean : `${Math.round(num * t)}h`),
        };
      }
      const commaMatch = clean.match(/^[\d,]+$/);
      if (commaMatch) {
        const num = parseInt(clean.replace(/,/g, ''), 10);
        return {
          finalText: clean,
          format: (t) => (t >= 1 ? clean : Math.round(num * t).toLocaleString('en-US')),
        };
      }
      return null;
    };

    const runTextCounter = (el, spec) => {
      if (el.dataset.cbCounted) return;
      el.dataset.cbCounted = '1';
      if (prefersReduced) {
        el.textContent = spec.finalText;
        return;
      }
      const dur = 1150;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = spec.format(eased);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const statEls = [...document.querySelectorAll('.hack-stat__num')].filter(
      (el) => !el.hasAttribute('data-count')
    );

    if (statEls.length && 'IntersectionObserver' in window && !prefersReduced) {
      const statObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const spec = el._cbSpec;
            if (spec) runTextCounter(el, spec);
            statObs.unobserve(el);
          });
        },
        { threshold: 0.28 }
      );
      statEls.forEach((el) => {
        const spec = parseStatSpec(el.textContent);
        if (spec) {
          el._cbSpec = spec;
          statObs.observe(el);
        }
      });
    }
  }

  /* ── 9. Card 3D Tilt & Cursor Glow (Desktop Only) ──────────── */
  if (FLAGS.cardTiltGlow && canHover && !prefersReduced) {
    document
      .querySelectorAll('.feature-card, .inside-item, .timeline-card, .hack-stat, .event-meta-cell')
      .forEach((card) => {
        card.classList.add('cb-glow-card');
        const allowTilt = !card.classList.contains('inside-item');
        if (allowTilt) card.classList.add('cb-tilt-card');

        card.addEventListener('pointermove', (e) => {
          const r = card.getBoundingClientRect();
          const x = e.clientX - r.left;
          const y = e.clientY - r.top;
          card.style.setProperty('--mx', `${x.toFixed(1)}px`);
          card.style.setProperty('--my', `${y.toFixed(1)}px`);
          if (allowTilt && r.width > 0 && r.height > 0) {
            const rx = ((0.5 - y / r.height) * 5).toFixed(2);
            const ry = ((x / r.width - 0.5) * 6).toFixed(2);
            card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translate3d(0, -3px, 0)`;
          }
        }, { passive: true });

        card.addEventListener('pointerleave', () => {
          if (allowTilt) card.style.transform = '';
        });
      });
  }

  /* ── 10. Floating Role Chips + Tap Highlight ───────────────── */
  if (FLAGS.roleChips) {
    const chips = [...document.querySelectorAll('.people-tag')];
    chips.forEach((chip, i) => {
      chip.style.setProperty('--ci', String(i));
      chip.addEventListener('click', () => {
        const was = chip.classList.contains('is-tapped');
        chips.forEach((c) => c.classList.remove('is-tapped'));
        if (!was) chip.classList.add('is-tapped');
      });
    });
  }

  /* ── 11. Sponsors: Opposite Marquee Rows (Desktop & Mobile) ─── */
  if (FLAGS.sponsorMarquees && !prefersReduced) {
    const prepareClone = (node) => {
      const copy = node.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      copy.setAttribute('data-clone', 'true');
      copy.querySelectorAll('.reveal').forEach((r) => r.classList.add('is-visible'));
      copy.querySelectorAll('a, button').forEach((a) => a.setAttribute('tabindex', '-1'));
      return copy;
    };

    const setupSponsorMarquee = (grid, direction) => {
      if (!grid || grid.dataset.marqueeInit) return;
      grid.dataset.marqueeInit = '1';
      const wrapper = document.createElement('div');
      wrapper.className = 'cb-sponsor-marquee';
      const track = document.createElement('div');
      track.className = `cb-sponsor-track cb-sponsor-track--${direction}`;

      const half1 = document.createElement('div');
      half1.className = 'cb-sponsor-half';
      const half2 = document.createElement('div');
      half2.className = 'cb-sponsor-half';
      half2.setAttribute('aria-hidden', 'true');
      half2.setAttribute('data-clone', 'true');

      grid.parentNode.insertBefore(wrapper, grid);
      half1.appendChild(grid);
      half1.appendChild(prepareClone(grid));
      half2.appendChild(prepareClone(grid));
      half2.appendChild(prepareClone(grid));
      track.appendChild(half1);
      track.appendChild(half2);
      wrapper.appendChild(track);
    };

    document.querySelectorAll('.sponsor-grid--current').forEach((g) => setupSponsorMarquee(g, 'left'));
    document.querySelectorAll('.sponsor-grid--previous').forEach((g) => setupSponsorMarquee(g, 'right'));
  }

  /* ── 12. Buttons: ↗ Arrow Slide & Desktop Magnetic Hover ───── */
  if (FLAGS.buttonFx) {
    document.querySelectorAll('a, button').forEach((ctrl) => {
      [...ctrl.childNodes].forEach((node) => {
        if (node.nodeType !== Node.TEXT_NODE) return;
        const val = node.nodeValue || '';
        const idx = val.lastIndexOf('↗');
        if (idx === -1) return;
        const before = val.slice(0, idx);
        const after = val.slice(idx + 1);
        const frag = document.createDocumentFragment();
        if (before) frag.appendChild(document.createTextNode(before));
        const span = document.createElement('span');
        span.className = 'cb-arrow';
        span.setAttribute('aria-hidden', 'true');
        span.textContent = '↗';
        frag.appendChild(span);
        if (after) frag.appendChild(document.createTextNode(after));
        ctrl.replaceChild(frag, node);
      });
    });

    if (canHover && !prefersReduced) {
      document.querySelectorAll('.btn-amber, .hero__actions .btn').forEach((btn) => {
        btn.addEventListener('pointermove', (e) => {
          const r = btn.getBoundingClientRect();
          const dx = Math.max(-7, Math.min(7, (e.clientX - (r.left + r.width / 2)) * 0.16));
          const dy = Math.max(-5, Math.min(5, (e.clientY - (r.top + r.height / 2)) * 0.18));
          btn.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
        }, { passive: true });
        btn.addEventListener('pointerleave', () => {
          btn.style.transform = '';
        });
      });
    }
  }

  /* ── 13. Sticky Bottom Mobile Bar ("Register on Unstop") ───── */
  if (FLAGS.mobileBar && document.body) {
    const heroSection = document.querySelector('#overview, #hack-overview');
    if (heroSection && 'IntersectionObserver' in window) {
      const bar = document.createElement('div');
      bar.className = 'cb-mobile-bar';
      bar.setAttribute('role', 'region');
      bar.setAttribute('aria-label', 'Quick registration actions');
      bar.innerHTML =
        '<a href="https://unstop.com/hackathons/codebuild-20-cobuild-1772164" class="btn btn-amber cb-mobile-bar__primary" target="_blank" rel="noopener noreferrer">' +
          'Register on Unstop <span class="cb-arrow" aria-hidden="true">↗</span>' +
        '</a>' +
        '<a href="https://chat.whatsapp.com/EelRt8CGKeU09pI7OBNC9F" class="cb-mobile-bar__secondary" target="_blank" rel="noopener noreferrer">' +
          'Join WhatsApp <span class="cb-arrow" aria-hidden="true">↗</span>' +
        '</a>';
      document.body.appendChild(bar);

      const heroObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const passedHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
            bar.classList.toggle('is-visible', passedHero);
            document.body.classList.toggle('has-mobile-bar', passedHero);
          });
        },
        { threshold: 0.05 }
      );
      heroObs.observe(heroSection);
    }
  }

  /* ── 14. Marquee Velocity Boost (Web Animations API) ───────── */
  const marqueeAnims = [];
  if (FLAGS.marqueeBoost && !prefersReduced) {
    document.querySelectorAll('.marquee-track').forEach((track) => {
      if (typeof track.getAnimations !== 'function') return;
      const anim = track.getAnimations()[0];
      if (!anim) return;
      marqueeAnims.push(anim);
      const wrap = track.closest('.live-marquee');
      if (wrap) {
        wrap.addEventListener('mouseenter', () => anim.pause());
        wrap.addEventListener('mouseleave', () => anim.play());
      }
    });
  }

  /* ── 15. Unified Scroll Loop (Progress, Parallax, Marquee Boost) */
  const parallaxNotes = [...document.querySelectorAll('[data-parallax]')];
  const heroForParallax = document.querySelector('#overview');
  const secLinks = [...document.querySelectorAll('.sec-link')];
  const lastSecLink = secLinks.length ? secLinks[secLinks.length - 1] : null;

  let lastScrollY = window.scrollY || 0;
  let lastTickTime = performance.now();
  let boostRate = 1;
  let boostRaf = null;
  let scrollQueued = false;

  const decayBoost = () => {
    boostRate += (1 - boostRate) * 0.08;
    marqueeAnims.forEach((a) => {
      try { a.playbackRate = boostRate; } catch { /* noop */ }
    });
    if (Math.abs(boostRate - 1) > 0.015) {
      boostRaf = requestAnimationFrame(decayBoost);
    } else {
      boostRate = 1;
      marqueeAnims.forEach((a) => {
        try { a.playbackRate = 1; } catch { /* noop */ }
      });
      boostRaf = null;
    }
  };

  const updateOnScroll = () => {
    scrollQueued = false;
    const now = performance.now();
    const y = window.scrollY || 0;
    const doc = document.documentElement;
    const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);

    if (progressBar) {
      const p = Math.min(1, Math.max(0, y / maxScroll));
      progressBar.style.transform = `scaleX(${p.toFixed(4)})`;
    }

    if (FLAGS.parallaxNotes && !prefersReduced && parallaxNotes.length && heroForParallax) {
      const rect = heroForParallax.getBoundingClientRect();
      if (rect.bottom > -80 && rect.top < window.innerHeight + 80) {
        const progress = Math.max(-1, Math.min(1.5, -rect.top / Math.max(400, rect.height)));
        parallaxNotes.forEach((note) => {
          const factor = parseFloat(note.getAttribute('data-parallax') || '0');
          const base = note.classList.contains('hero__note-main') ? -20 : 10;
          note.style.setProperty('--py', `${(base + progress * factor).toFixed(1)}px`);
        });
      }
    }

    if (FLAGS.marqueeBoost && marqueeAnims.length) {
      const dt = Math.max(16, now - lastTickTime);
      const velocity = Math.min(3.5, Math.abs(y - lastScrollY) / dt);
      const nextRate = Math.min(2.35, 1 + velocity * 0.45);
      if (nextRate > boostRate) {
        boostRate = nextRate;
        marqueeAnims.forEach((a) => {
          try { a.playbackRate = boostRate; } catch { /* noop */ }
        });
        if (!boostRaf) boostRaf = requestAnimationFrame(decayBoost);
      }
    }

    if (FLAGS.scrollspyFix && lastSecLink && y >= maxScroll - 36) {
      secLinks.forEach((l) => l.classList.toggle('is-active', l === lastSecLink));
    }

    lastScrollY = y;
    lastTickTime = now;
  };

  window.addEventListener('scroll', () => {
    if (!scrollQueued) {
      scrollQueued = true;
      requestAnimationFrame(updateOnScroll);
    }
  }, { passive: true });

  updateOnScroll();
})();
