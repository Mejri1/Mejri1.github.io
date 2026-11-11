/* Omar Mejri · portfolio interactions. No dependencies. */
(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const EMAIL = 'omaarmeejri1@gmail.com';
  const CV = 'assets/Omar_Mejri_CV.pdf';

  /* ---------- Toast & clipboard ---------- */
  const toastEl = $('[data-toast]');
  let toastTimer;
  function toast(msg) {
    toastEl.innerHTML = '<svg class="ic" aria-hidden="true"><use href="#u-check"/></svg>' + msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2200);
  }
  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch {}
      ta.remove();
    }
    toast('Email copied to clipboard');
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-copy]');
    if (b) copy(b.getAttribute('data-copy'));
  });

  /* ---------- Theme ---------- */
  const root = document.documentElement;
  const themeBtn = $('[data-theme-toggle]');
  function syncThemeLabel() {
    const t = root.getAttribute('data-theme');
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
  function toggleTheme() {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch {}
    syncThemeLabel();
  }
  themeBtn.addEventListener('click', toggleTheme);
  syncThemeLabel();

  /* ---------- Modifier key label ---------- */
  $$('[data-mod]').forEach((k) => (k.textContent = isMac ? '⌘' : 'Ctrl'));

  /* ---------- Nav: scrolled state, mobile menu, active link ---------- */
  const nav = $('.nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const burger = $('[data-burger]');
  const mobileMenu = $('#mobile-menu');
  function setMenu(open) {
    mobileMenu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    burger.querySelector('use').setAttribute('href', open ? '#u-x' : '#u-menu');
  }
  burger.addEventListener('click', () => setMenu(mobileMenu.hidden));
  mobileMenu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 1080) setMenu(false); });

  const sections = $$('main section[id]');
  const navLinks = $$('.nav__links a');
  const specName = $('[data-spec-name]');
  const specStatus = $('.spec-status');
  const specProgress = $('[data-spec-progress]');

  const activeObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const id = en.target.id;
      navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + id));
      if (en.target.dataset.spec) specName.textContent = en.target.dataset.spec;
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => activeObs.observe(s));

  function updateSpec() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    specProgress.style.width = (p * 100).toFixed(1) + '%';
    specStatus.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
    if (sections[0] && window.scrollY < sections[0].offsetTop - window.innerHeight * 0.5) {
      navLinks.forEach((a) => a.classList.remove('is-active'));
      specName.textContent = 'portfolio.spec.ts';
    }
    const done = p > 0.985;
    specStatus.classList.toggle('is-done', done);
    if (done) specName.textContent = '7 specs passed';
  }
  updateSpec();
  window.addEventListener('scroll', updateSpec, { passive: true });

  /* ---------- Reveal on scroll ---------- */
  const title = $('.hero__title');
  $$('.hero__title .line > span').forEach((s, i) => s.style.setProperty('--i', i));
  requestAnimationFrame(() => requestAnimationFrame(() => title.classList.add('is-in')));

  // Stagger siblings within the same parent.
  const groups = new Map();
  $$('.reveal').forEach((el) => {
    const p = el.parentElement;
    const n = groups.get(p) || 0;
    el.style.setProperty('--d', Math.min(n * 0.07, 0.42) + 's');
    groups.set(p, n + 1);
  });
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); revealObs.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('.reveal').forEach((el) => revealObs.observe(el));

  /* ---------- Count-up metrics ---------- */
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      countObs.unobserve(el);
      const target = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.decimals || '0', 10);
      if (reduced) { el.textContent = target.toFixed(dec); return; }
      const t0 = performance.now(), dur = 1400;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        const e = 1 - Math.pow(1 - k, 4);
        el.textContent = (target * e).toFixed(dec);
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => countObs.observe(el));

  /* ---------- Badge tilt ---------- */
  const badge = $('[data-tilt]');
  if (badge && !reduced && window.matchMedia('(hover: hover)').matches) {
    let raf;
    badge.addEventListener('pointermove', (e) => {
      const r = badge.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        badge.classList.add('is-tilting');
        badge.style.setProperty('--ry', ((x - 0.5) * 14).toFixed(2) + 'deg');
        badge.style.setProperty('--rx', ((0.5 - y) * 12).toFixed(2) + 'deg');
        badge.style.setProperty('--sx', (x * 100).toFixed(1) + '%');
        badge.style.setProperty('--sy', (y * 100).toFixed(1) + '%');
      });
    });
    badge.addEventListener('pointerleave', () => {
      badge.classList.remove('is-tilting');
      badge.style.setProperty('--rx', '0deg');
      badge.style.setProperty('--ry', '0deg');
    });
  }

  /* ---------- Spotlight cards ---------- */
  document.addEventListener('pointermove', (e) => {
    const c = e.target.closest && e.target.closest('.spot');
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* ---------- Clock & year ---------- */
  const clock = $('[data-clock]');
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Tunis', hour: '2-digit', minute: '2-digit' });
  const tick = () => { clock.textContent = fmt.format(new Date()); clock.setAttribute('datetime', new Date().toISOString()); };
  tick(); setInterval(tick, 20000);
  $$('[data-year]').forEach((y) => (y.textContent = new Date().getFullYear()));

  /* =========================================================
     Spec-to-test runner
     ========================================================= */
  const runner = $('[data-runner]');
  const paneSpec = $('[data-pane="spec"]');
  const paneCode = $('[data-pane="code"]');
  const paneTerm = $('[data-pane="term"]');
  const stages = $$('.runner__stages li');

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function hlGherkin(line) {
    let s = esc(line);
    s = s.replace(/(&quot;|")(.*?)(")/g, '<span class="str">"$2"</span>');
    s = s.replace(/^(\s*)(Feature:|Scenario:|Given|When|Then|And)/, '$1<span class="gk">$2</span>');
    return s;
  }
  function hlTs(line) {
    if (/^\s*\/\//.test(line)) return '<span class="cm">' + esc(line) + '</span>';
    const parts = [];
    let s = line.replace(/(['`])(?:\\.|(?!\1).)*\1/g, (m) => { parts.push(m); return '\u0000' + (parts.length - 1) + '\u0000'; });
    s = esc(s);
    s = s.replace(/\b(import|from|async|function|await|const|return)\b/g, '<span class="kw">$1</span>');
    s = s.replace(/\b(Given|When|Then|expect|getByRole|getByPlaceholder|getByText|locator|click|fill|toBeVisible)\b/g, '<span class="fn">$1</span>');
    s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => '<span class="str">' + esc(parts[+i]) + '</span>');
    return s;
  }

  const SPEC = [
    'Feature: Employee management on OrangeHRM',
    '',
    '  Scenario: Admin adds a new employee',
    '    Given I am logged in as "Admin"',
    '    When I open the "PIM" menu',
    '    And I click the "Add Employee" button',
    '    And I enter "John" "Doe" as the employee name',
    '    And I click the "Save" button',
    '    Then I should see the text "Personal Details"',
  ];

  const CODE = [
    "import { Given, When, Then } from '@cucumber/cucumber';",
    "import { expect } from '@playwright/test';",
    '',
    "When('I open the {string} menu', async function (menu) {",
    "  await this.page.getByRole('link', { name: menu }).click();",
    '});',
    '',
    "When('I click the {string} button', async function (label) {",
    { key: 'brittle', text: "  await this.page.locator(`button#${slug(label)}`).click();" },
    '});',
    '',
    "When('I enter {string} {string} as the employee name',",
    '  async function (first, last) {',
    "    await this.page.getByPlaceholder('First Name').fill(first);",
    "    await this.page.getByPlaceholder('Last Name').fill(last);",
    '});',
    '',
    "Then('I should see the text {string}', async function (text) {",
    '  await expect(this.page.getByText(text)).toBeVisible();',
    '});',
  ];

  let runId = 0;
  const wait = (ms, id) => new Promise((res, rej) => setTimeout(() => (id === runId ? res() : rej('cancel')), reduced ? 0 : ms));

  function addLine(pane, html, cls) {
    const caret = pane.querySelector('.caret');
    if (caret) caret.remove();
    const el = document.createElement('span');
    el.className = 'ln' + (cls ? ' ' + cls : '');
    el.innerHTML = html || '&#8203;';
    pane.appendChild(el);
    if (!reduced) {
      const c = document.createElement('span');
      c.className = 'caret';
      pane.appendChild(c);
    }
    pane.scrollTop = pane.scrollHeight;
    return el;
  }
  function setStage(i, state) {
    stages.forEach((li, j) => {
      li.classList.remove('is-active', 'is-heal');
      if (j < i) li.classList.add('is-done');
      else li.classList.remove('is-done');
    });
    if (stages[i]) stages[i].classList.add(state === 'heal' ? 'is-heal' : 'is-active');
    if (i >= stages.length) stages.forEach((li) => li.classList.add('is-done'));
  }
  const T = (cls, text) => '<span class="' + cls + '">' + esc(text) + '</span>';

  async function run() {
    const id = ++runId;
    paneSpec.innerHTML = ''; paneCode.innerHTML = ''; paneTerm.innerHTML = '';
    stages.forEach((li) => li.classList.remove('is-done', 'is-active', 'is-heal'));
    try {
      // 0. Spec
      setStage(0);
      for (const l of SPEC) { addLine(paneSpec, hlGherkin(l)); await wait(l ? 170 : 60, id); }
      await wait(350, id);

      // 1. Analyse
      setStage(1);
      addLine(paneTerm, T('dim', '$ ') + 'spec2test run add_employee.feature');
      await wait(450, id);
      addLine(paneTerm, T('warn', '›') + ' analysing spec… ' + T('dim', '1 scenario · 6 steps'));
      await wait(650, id);
      addLine(paneTerm, T('warn', '›') + ' resolving UI elements on ' + T('dim', '/pim/addEmployee'));
      await wait(650, id);
      addLine(paneTerm, T('ok', '✓') + ' 5 targets mapped to step definitions');
      await wait(400, id);

      // 2. Generate
      setStage(2);
      const keyed = {};
      for (const l of CODE) {
        const text = typeof l === 'string' ? l : l.text;
        const el = addLine(paneCode, hlTs(text));
        if (typeof l !== 'string') keyed[l.key] = el;
        await wait(text ? 85 : 40, id);
      }
      addLine(paneTerm, T('ok', '✓') + ' generated add_employee.steps.ts ' + T('dim', '(4 step defs)'));
      await wait(500, id);

      // 3. Execute
      setStage(3);
      addLine(paneTerm, T('warn', '›') + ' running in chromium (headless)');
      await wait(500, id);
      addLine(paneTerm, T('ok', '  ✓') + ' Given I am logged in as "Admin" ' + T('dim', '812ms'));
      await wait(420, id);
      addLine(paneTerm, T('ok', '  ✓') + ' When I open the "PIM" menu ' + T('dim', '214ms'));
      await wait(600, id);
      addLine(paneTerm, T('bad', '  ✗') + ' And I click the "Add Employee" button', 'hlbad');
      addLine(paneTerm, T('bad', '    locator button#add-employee: element not found'));
      if (keyed.brittle) keyed.brittle.classList.add('hlbad');
      await wait(900, id);

      // 4. Heal
      setStage(4, 'heal');
      addLine(paneTerm, T('warn', '  ↻') + ' self-heal: reading the live DOM…');
      await wait(800, id);
      addLine(paneTerm, T('warn', '  ↻') + ' best candidate ' + T('str', "getByRole('button', { name })") + T('dim', ' 0.94'));
      await wait(500, id);
      if (keyed.brittle) {
        keyed.brittle.classList.remove('hlbad');
        keyed.brittle.classList.add('hl');
        keyed.brittle.innerHTML = hlTs("  await this.page.getByRole('button', { name: label }).click(); // healed");
      }
      await wait(500, id);
      addLine(paneTerm, T('ok', '  ✓') + ' And I click the "Add Employee" button ' + T('dim', '301ms · healed'));
      await wait(380, id);
      addLine(paneTerm, T('ok', '  ✓') + ' And I enter "John" "Doe" as the employee name ' + T('dim', '446ms'));
      await wait(380, id);
      addLine(paneTerm, T('ok', '  ✓') + ' And I click the "Save" button ' + T('dim', '590ms'));
      await wait(380, id);
      addLine(paneTerm, T('ok', '  ✓') + ' Then I should see the text "Personal Details" ' + T('dim', '133ms'));
      await wait(500, id);

      // 5. Report
      setStage(5);
      addLine(paneTerm, '<span class="sum">' + T('ok', '1 scenario (1 passed)') + '</span>');
      addLine(paneTerm, T('ok', '6 steps (6 passed)') + T('dim', ' · 1 locator healed · 3.1s'));
      await wait(400, id);
      addLine(paneTerm, T('dim', 'report → reports/add_employee.html · trace saved'));
      await wait(500, id);
      setStage(6);
      const c = paneTerm.querySelector('.caret'); if (c) c.remove();
      $$('.caret', runner).forEach((x) => x.remove());
    } catch (e) { /* cancelled by replay */ }
  }

  if (runner) {
    $('[data-runner-replay]').addEventListener('click', run);
    const runObs = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { runObs.disconnect(); run(); }
    }, { threshold: 0.35 });
    runObs.observe(runner);
  }

  /* =========================================================
     Project filters
     ========================================================= */
  const filters = $$('.filter');
  filters.forEach((f) => f.addEventListener('click', () => {
    const cat = f.dataset.filter;
    filters.forEach((x) => { const on = x === f; x.classList.toggle('is-active', on); x.setAttribute('aria-pressed', String(on)); });
    $$('[data-projects] > [data-cat]').forEach((el) => {
      const show = cat === 'all' || el.dataset.cat.split(' ').includes(cat);
      el.classList.toggle('is-hidden', !show);
      if (show) el.classList.add('is-in');
    });
  }));

  /* =========================================================
     Project case studies (modal)
     ========================================================= */
  const GH = 'https://github.com/Mejri1/';
  const PROJECTS = {
    spec2test: {
      meta: 'Talan Tunisia · Final-year engineering project · 02/2026 – 06/2026',
      title: 'Spec-to-Playwright AI platform',
      lead: 'Writing E2E tests by hand is slow, and the specs they come from are already written in plain language. I built a platform that closes that gap: an LLM agent pipeline that reads natural-language specifications and produces executable Playwright tests.',
      stats: [['20.8×', 'faster test creation'], ['90%', 'pass rate on functional scenarios']],
      built: [
        'An LLM agent pipeline that goes from spec analysis to test generation and execution.',
        'Generated tests in Playwright (JavaScript) with Cucumber/Gherkin, so the requirement stays readable next to the code.',
        'Adaptive element resolution, so tests stay robust when the UI changes.',
        'Reusable test artifacts, execution reports and traces for every run.',
        'LLM observability and traceability with Langfuse.',
      ],
      stack: ['LLM agents', 'Playwright', 'JavaScript', 'Cucumber / Gherkin', 'Langfuse'],
      private: 'Built for Talan Tunisia. The source code is proprietary.',
    },
    selfheal: {
      meta: 'Open source · 2026',
      title: 'Self-healing test validation system',
      lead: 'A multi-agent system that validates web applications end to end without human intervention: it parses Gherkin, writes Selenium scripts, runs them in a real browser and repairs broken locators on the fly.',
      built: [
        'A LangGraph workflow of specialised agents: Explorer, Analyst, Script Writer, Executor, Self-Healer and Reporter.',
        'The Explorer captures a screenshot and the page HTML and asks a vision-capable model for page intelligence (login forms, captcha, 2FA, uploads).',
        'When a locator fails, the Self-Healer reads the live DOM, ranks three alternative locators, patches the script and re-runs it (up to three retries).',
        'Self-contained HTML and JSON reports with a screenshot for every step.',
        'Multi-provider LLM factory (Groq, Cerebras or a local LM Studio model), switchable from .env.',
      ],
      stack: ['Python', 'LangGraph', 'LangChain', 'Selenium 4', 'BeautifulSoup', 'Jinja2'],
      links: [['View on GitHub', GH + 'Functional-Test-Validation-System-']],
    },
    regression: {
      meta: 'Talan Tunisia · Redion / Europ Assistance · 07/2026 – 10/2026',
      title: 'Agentic regression-testing workflow',
      lead: 'On an insurance web platform for Europ Assistance, I evaluated how far an agent framework could take a real test lifecycle, then designed a workflow to make agentic regression testing reusable across stacks.',
      built: [
        'Evaluated the BMad Method TEA agent framework across test design, ATDD, automation and review.',
        'Automated E2E scenarios with Playwright, TypeScript and Cucumber (BDD) in a Page Object Model, using MCP Playwright.',
        'Industrialised execution: Azure DevOps CI/CD pipelines with triggers, Dockerised runs and Allure reports.',
        'Designed a stack-agnostic agentic regression-testing workflow that extends the agent’s capabilities.',
      ],
      stack: ['Playwright', 'TypeScript', 'Cucumber', 'MCP', 'BMad Method', 'Azure DevOps', 'Docker', 'Allure'],
      private: 'Client work. The code and test assets belong to the client.',
    },
    contract: {
      meta: 'Open source · 2026',
      title: 'AI-assisted API contract testing',
      lead: 'APIs evolve, and contract tests break for both good and bad reasons. This project lets an AI explain a failure, while deterministic guardrails decide whether a fix is safe to apply.',
      built: [
        'A small FastAPI service and JSON contract tests that validate fields, types and enums.',
        'An AI failure analyser that compares expected and actual payloads and proposes a structured fix.',
        'A guardrail engine that only accepts safe, backward-compatible changes.',
        'A self-repair step that updates a temporary copy of the contract and re-validates it.',
        'Structured JSON logs of every failure, AI decision and repair outcome.',
      ],
      stack: ['Python', 'FastAPI', 'pytest', 'LLM (LM Studio-ready)'],
      links: [['View on GitHub', GH + 'AI-test']],
    },
    harmony: {
      meta: 'Hydatis · AI & NLP internship · 06/2025 – 08/2025',
      title: 'Harmony HR assistant',
      lead: 'An AI assistant that helps startup employees with HR questions and concerns, grounded in company documents and aware of the conversation so far.',
      built: [
        'A LangChain conversational system with memory and summarisation.',
        'A RAG pipeline (Firestore + ChromaDB) for context-aware answers.',
        'Intent classification with RoBERTa to route between RAG and non-RAG answers.',
        'Mistral 7B, RoBERTa and BART for multilingual (French and English) support and summarisation.',
        'A Streamlit web app with Firebase authentication.',
      ],
      stack: ['Python', 'LangChain', 'ChromaDB', 'Firebase', 'Streamlit', 'Hugging Face Transformers'],
      links: [['View on GitHub', GH + 'harmony-hr-assistant']],
    },
    talentmatch: {
      meta: 'GitHub · 2025',
      title: 'TalentMatch recruitment platform',
      lead: 'A full-stack recruitment platform that matches job seekers to openings using NLP rather than keyword search.',
      built: [
        'Resume parsing that extracts skills, education and experience from PDF CVs, and strips personal details.',
        'Semantic matching between resumes and job descriptions with sentence transformers and cosine similarity.',
        'Technical quizzes generated from the job requirements, with real-time scoring.',
        'Job posting management and application tracking on PostgreSQL.',
        'A React + TypeScript front end with Tailwind CSS.',
      ],
      stack: ['Python', 'Flask', 'spaCy', 'Sentence Transformers', 'PostgreSQL', 'React', 'TypeScript'],
      links: [['View on GitHub', GH + 'AI-powered-recruitment']],
    },
    crew: {
      meta: 'GitHub · 2025',
      title: 'Multi-agent data science crew',
      lead: 'An agentic system that automates a first pass of data science work: from a business question and a CSV to a technical report.',
      built: [
        'Four CrewAI agents: Project Planner, Data Analyst, Modelling Agent and Report Writer.',
        'Custom tools for reading CSVs and computing dataset statistics.',
        'A sequential workflow with context passed between agents.',
        'LLaMA models via Hugging Face; the output is a structured Markdown report.',
      ],
      stack: ['Python', 'CrewAI', 'LLaMA', 'Hugging Face'],
      links: [['View on GitHub', GH + 'Agentic-IA']],
    },
    federated: {
      meta: 'GitHub · 2025',
      title: 'Federated learning for face recognition',
      lead: 'Can you train a useful face recognition model without centralising anyone’s photos? This project compares three ways to find out.',
      built: [
        'Local training: an independent model per participant, on isolated data.',
        'Centralised learning: one model trained on all the data pooled together.',
        'Federated learning: distributed training with FedAvg parameter aggregation, no raw data shared.',
        'A comparison of performance, privacy and communication cost in notebooks.',
      ],
      stack: ['Python', 'Jupyter', 'FedAvg'],
      links: [['View on GitHub', GH + 'Federated-Learning']],
    },
  };

  const modal = $('[data-modal]');
  const modalContent = $('[data-modal-content]');
  let lastFocus = null;

  function openProject(key) {
    const p = PROJECTS[key];
    if (!p) return;
    lastFocus = document.activeElement;
    const li = (arr) => arr.map((x) => '<li>' + esc(x) + '</li>').join('');
    let html = '<p class="card__meta">' + esc(p.meta) + '</p>';
    html += '<h2 id="modal-title">' + esc(p.title) + '</h2>';
    html += '<p class="lead">' + esc(p.lead) + '</p>';
    if (p.stats) html += '<div class="modal__stats">' + p.stats.map(([b, s]) => '<div><b>' + esc(b) + '</b><span>' + esc(s) + '</span></div>').join('') + '</div>';
    html += '<h4>What I built</h4><ul class="bullets">' + li(p.built) + '</ul>';
    html += '<h4>Stack</h4><ul class="chips">' + li(p.stack) + '</ul>';
    html += '<div class="modal__links">';
    if (p.links) html += p.links.map(([t, u]) => '<a class="btn btn--primary btn--sm" href="' + u + '" target="_blank" rel="noopener"><svg class="ic" aria-hidden="true"><use href="#i-github"/></svg>' + esc(t) + '</a>').join('');
    if (p.private) html += '<span class="modal__private"><svg class="ic" aria-hidden="true"><use href="#u-lock"/></svg>' + esc(p.private) + '</span>';
    html += '<button type="button" class="btn btn--ghost btn--sm" data-modal-close>Close</button></div>';
    modalContent.innerHTML = html;
    modal.showModal();
    modal.scrollTop = 0;
    if (location.hash !== '#project-' + key) history.replaceState(null, '', '#project-' + key);
  }
  function closeModal() { if (modal.open) modal.close(); }
  modal.addEventListener('close', () => {
    if (location.hash.startsWith('#project-')) history.replaceState(null, '', location.pathname + location.search + '#projects');
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.closest('[data-modal-close]')) closeModal();
  });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-open-project]');
    if (b) { e.stopPropagation(); openProject(b.dataset.openProject); return; }
    const card = e.target.closest('.card[data-project]');
    if (card && !e.target.closest('a, button')) openProject(card.dataset.project);
  });
  // Deep link: #project-<key>
  const deep = location.hash.match(/^#project-(\w+)/);
  if (deep && PROJECTS[deep[1]]) {
    const target = $('#projects');
    if (target) target.scrollIntoView();
    setTimeout(() => openProject(deep[1]), 250);
  }

  /* =========================================================
     Command palette
     ========================================================= */
  const palette = $('[data-palette]');
  const pInput = $('[data-palette-input]');
  const pList = $('[data-palette-list]');
  const go = (id) => () => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); };
  const openUrl = (u) => () => window.open(u, '_blank', 'noopener');

  const COMMANDS = [
    { g: 'Navigate', label: 'Approach: spec to test', icon: 'u-arrow', run: go('pipeline'), hint: '01' },
    { g: 'Navigate', label: 'Experience', icon: 'u-arrow', run: go('experience'), hint: '02' },
    { g: 'Navigate', label: 'Projects', icon: 'u-arrow', run: go('projects'), hint: '03' },
    { g: 'Navigate', label: 'Stack', icon: 'u-arrow', run: go('stack'), hint: '04' },
    { g: 'Navigate', label: 'Education & certifications', icon: 'u-arrow', run: go('education'), hint: '05' },
    { g: 'Navigate', label: 'About', icon: 'u-arrow', run: go('about'), hint: '06' },
    { g: 'Navigate', label: 'Contact', icon: 'u-arrow', run: go('contact'), hint: '07' },
    { g: 'Actions', label: 'Download CV (PDF)', icon: 'u-download', run: () => { const a = document.createElement('a'); a.href = CV; a.download = 'Omar_Mejri_CV.pdf'; document.body.appendChild(a); a.click(); a.remove(); } },
    { g: 'Actions', label: 'Copy email address', icon: 'u-copy', run: () => copy(EMAIL), hint: EMAIL },
    { g: 'Actions', label: 'Write an email', icon: 'u-mail', run: () => { location.href = 'mailto:' + EMAIL; } },
    { g: 'Actions', label: 'Open LinkedIn', icon: 'u-linkedin', run: openUrl('https://www.linkedin.com/in/omar-mejri/') },
    { g: 'Actions', label: 'Open GitHub', icon: 'i-github', run: openUrl('https://github.com/Mejri1') },
    { g: 'Actions', label: 'Toggle light / dark theme', icon: 'u-sun', run: toggleTheme },
    { g: 'Actions', label: 'Replay the spec-to-test demo', icon: 'u-replay', run: () => { go('pipeline')(); setTimeout(run, 500); } },
    ...Object.entries(PROJECTS).map(([k, p]) => ({ g: 'Projects', label: p.title, icon: 'u-arrow-up-right', run: () => openProject(k) })),
  ];

  let filtered = COMMANDS, sel = 0;
  function renderPalette() {
    const q = pInput.value.trim().toLowerCase();
    filtered = COMMANDS.filter((c) => !q || (c.label + ' ' + c.g).toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(0, filtered.length - 1));
    if (!filtered.length) { pList.innerHTML = '<li class="palette__empty">No results for “' + esc(pInput.value) + '”</li>'; pInput.removeAttribute('aria-activedescendant'); return; }
    let html = '', lastG = '';
    filtered.forEach((c, i) => {
      if (c.g !== lastG) { html += '<li class="palette__group" role="presentation">' + c.g + '</li>'; lastG = c.g; }
      html += '<li class="palette__item" role="option" id="pc-' + i + '" data-i="' + i + '" aria-selected="' + (i === sel) + '">' +
        '<svg class="ic" aria-hidden="true"' + (c.icon.startsWith('i-') || c.icon === 'u-linkedin' ? ' style="fill:currentColor"' : '') + '><use href="#' + c.icon + '"/></svg>' +
        '<span>' + esc(c.label) + '</span>' + (c.hint ? '<small>' + esc(c.hint) + '</small>' : '') + '</li>';
    });
    pList.innerHTML = html;
    pInput.setAttribute('aria-activedescendant', 'pc-' + sel);
    const cur = pList.querySelector('[aria-selected="true"]');
    if (cur) cur.scrollIntoView({ block: 'nearest' });
  }
  function openPalette() {
    if (modal.open) modal.close();
    setMenu(false);
    pInput.value = ''; sel = 0; renderPalette();
    palette.showModal();
    pInput.focus();
  }
  function execSel(i) {
    const c = filtered[i];
    if (!c) return;
    palette.close();
    setTimeout(c.run, 60);
  }
  pInput.addEventListener('input', () => { sel = 0; renderPalette(); });
  pInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % Math.max(1, filtered.length); renderPalette(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + filtered.length) % Math.max(1, filtered.length); renderPalette(); }
    else if (e.key === 'Enter') { e.preventDefault(); execSel(sel); }
  });
  pList.addEventListener('click', (e) => { const it = e.target.closest('.palette__item'); if (it) execSel(+it.dataset.i); });
  pList.addEventListener('pointermove', (e) => {
    const it = e.target.closest('.palette__item');
    if (it && +it.dataset.i !== sel) { sel = +it.dataset.i; $$('.palette__item', pList).forEach((x) => x.setAttribute('aria-selected', String(+x.dataset.i === sel))); pInput.setAttribute('aria-activedescendant', 'pc-' + sel); }
  });
  palette.addEventListener('click', (e) => { if (e.target === palette) palette.close(); });
  $$('[data-open-palette]').forEach((b) => b.addEventListener('click', openPalette));
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      palette.open ? palette.close() : openPalette();
    } else if (e.key === '/' && !palette.open && !/input|textarea/i.test(document.activeElement.tagName)) {
      e.preventDefault(); openPalette();
    }
  });
})();
