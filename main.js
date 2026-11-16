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
    if (done) specName.textContent = '6 specs passed';
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
     Mission simulations (Redion · Upcoop)
     ========================================================= */
  const sim = $('[data-sim]');
  let playSim = () => {};
  if (sim) {
    const sStages = $('[data-sim-stages]', sim);
    const L = $('[data-sim-left]', sim);
    const R = $('[data-sim-right]', sim);
    const lTab = $('[data-sim-ltab]', sim);
    const rTab = $('[data-sim-rtab]', sim);
    const tabs = $$('[data-sim-tab]', sim);
    let simId = 0;
    let current = 'redion';

    const sw = (ms, id) => new Promise((res, rej) => setTimeout(() => (id === simId ? res() : rej('cancel')), reduced ? 0 : ms));
    function sStage(i, state) {
      $$('li', sStages).forEach((li, j) => {
        li.classList.remove('is-active', 'is-heal');
        li.classList.toggle('is-done', j < i);
      });
      const li = $$('li', sStages)[i];
      if (li) li.classList.add(state === 'bad' ? 'is-heal' : 'is-active');
    }
    const chip = (k, t) => '<span class="st-chip st-chip--' + k + '">' + t + '</span>';

    /* ----- Redion: BMad TEA + MCP Playwright -> Azure DevOps ----- */
    const ADO =
      '<div class="ado">' +
        '<div class="ado__head"><img src="assets/tech/azuredevops.svg" alt="" width="18" height="18"><b>e2e-regression</b><span class="ado__trig" data-ado-trig>waiting for trigger</span></div>' +
        '<ol class="ado__jobs">' +
          '<li data-job><i class="ado__st"></i><div><b>Build</b><small>docker build · Playwright image</small></div><time></time></li>' +
          '<li data-job><i class="ado__st"></i><div><b>Test</b><small>cucumber-js --tags @regression</small></div><time></time></li>' +
          '<li data-job><i class="ado__st"></i><div><b>Publish</b><small>Allure report → artifacts</small></div><time></time></li>' +
        '</ol>' +
        '<div class="ado__report" data-ado-report>' +
          '<div class="ado__bar"><i data-ado-pass></i></div>' +
          '<div class="ado__sum"><span data-ado-count>0 / 6 scenarios</span><span>Allure</span></div>' +
        '</div>' +
        '<div class="ado__triggers"><span>trigger: PR → develop</span><span>schedule: nightly</span></div>' +
      '</div>';

    const SIMS = {
      redion: {
        stages: ['Story', 'Test design', 'ATDD', 'Automate', 'Review', 'Pipeline'],
        ltab: '<span class="tag tag--ts">agent</span> BMad TEA · MCP Playwright',
        rtab: '<span class="tag tag--term">ADO</span> Azure Pipelines',
        build() { L.innerHTML = '<pre class="code" data-log></pre>'; R.innerHTML = ADO; },
        async play(id) {
          const log = $('[data-log]', L);
          const w = (ms) => sw(ms, id);
          const say = async (html, ms) => { addLine(log, html); await w(ms == null ? 420 : ms); };
          const cmd = (c, note) => T('dim', '$ ') + T('fn', c) + (note ? T('dim', '  · ' + note) : '');

          sStage(0);
          await say(T('cm', '# user story'), 200);
          await say(T('str', 'As a policyholder, I can submit an assistance request online.'), 800);

          sStage(1);
          await say(cmd('*test-design', 'TEA agent'), 500);
          await say(T('warn', '›') + ' risk-based coverage: happy path, missing fields, invalid dates', 650);
          await say(T('ok', '✓') + ' 6 scenarios, prioritised P0 → P2', 550);

          sStage(2);
          await say(cmd('*atdd'), 450);
          await say(T('gk', 'Scenario:') + ' Submit a request with valid details', 240);
          await say('  ' + T('gk', 'Given') + ' I am on the new request page', 200);
          await say('  ' + T('gk', 'When') + ' I fill in the trip details and submit', 200);
          await say('  ' + T('gk', 'Then') + ' I see the request confirmation', 450);
          await say(T('ok', '✓') + ' features/assistance_request.feature', 550);

          sStage(3);
          await say(cmd('*automate', 'MCP Playwright'), 450);
          await say(T('kw', 'mcp') + ' › browser_navigate ' + T('str', '/requests/new'), 380);
          await say(T('kw', 'mcp') + ' › browser_snapshot' + T('dim', '  element refs resolved'), 380);
          await say(T('kw', 'mcp') + ' › browser_fill_form' + T('dim', '  4 fields'), 380);
          await say(T('kw', 'mcp') + ' › browser_click ' + T('str', '"Submit"'), 380);
          await say(T('ok', '✓') + ' pages/RequestPage.ts · steps/request.steps.ts', 600);

          sStage(4);
          await say(cmd('*test-review'), 450);
          await say(T('ok', '✓') + ' Page Objects · no hard waits · tagged @regression', 500);
          await say(T('dim', '$ ') + 'git push → pull request into develop', 500);

          sStage(5);
          const trig = $('[data-ado-trig]', R);
          trig.textContent = 'triggered by PR';
          trig.classList.add('is-on');
          const jobs = $$('[data-job]', R);
          const time = (i, t) => { $('time', jobs[i]).textContent = t; };
          await say(T('warn', '›') + ' Azure Pipelines: e2e-regression queued', 350);

          jobs[0].classList.add('is-run'); await w(1100);
          jobs[0].classList.replace('is-run', 'is-ok'); time(0, '48s');

          jobs[1].classList.add('is-run');
          $('[data-ado-report]', R).classList.add('is-on');
          const bar = $('[data-ado-pass]', R), cnt = $('[data-ado-count]', R);
          for (let k = 1; k <= 6; k++) {
            await w(420);
            bar.style.width = (k / 6 * 100) + '%';
            cnt.textContent = k + ' / 6 scenarios passed';
          }
          jobs[1].classList.replace('is-run', 'is-ok'); time(1, '3m 12s');

          jobs[2].classList.add('is-run'); await w(800);
          jobs[2].classList.replace('is-run', 'is-ok'); time(2, '21s');
          await say(T('ok', '✓') + ' pipeline succeeded · Allure report published', 200);
        },
      },

      /* ----- Upcoop: manual QA -> bug -> AI drafts -> Appium ----- */
      upcoop: {
        stages: ['Story', 'Test cases', 'Manual run', 'Bug', 'AI draft', 'Appium'],
        ltab: '<span class="tag tag--gherkin">QA</span> test cases',
        rtab: '<span class="tag tag--term">apk</span> mobile app · Android',
        build() {
          L.innerHTML = '<div class="tc"><table><thead><tr><th>ID</th><th>Case</th><th>Status</th></tr></thead><tbody data-tc></tbody></table><div class="tc__extra" data-tc-extra></div></div>';
          R.innerHTML =
            '<div class="mob">' +
              '<div class="phone"><div class="phone__screen" data-screen></div><span class="phone__tap" data-tap></span></div>' +
              '<div class="mob__side"><span class="mob__mode" data-mode>idle</span><pre class="code code--term" data-mlog></pre></div>' +
            '</div>';
          $('[data-screen]', R).innerHTML = SCREENS.login({});
        },
        async play(id) {
          const w = (ms) => sw(ms, id);
          const wrap = $('.tc', L), tb = $('[data-tc]', L), extra = $('[data-tc-extra]', L);
          const scr = $('[data-screen]', R), tapEl = $('[data-tap]', R), mode = $('[data-mode]', R), mlog = $('[data-mlog]', R);
          const phone = $('.phone', R);
          const show = (name, o) => { scr.innerHTML = SCREENS[name](o || {}); };
          const row = (rid, txt, st) => {
            const tr = document.createElement('tr');
            tr.dataset.id = rid;
            tr.innerHTML = '<td>' + rid + '</td><td>' + esc(txt) + '</td><td data-st>' + st + '</td>';
            tb.appendChild(tr);
            wrap.scrollTop = wrap.scrollHeight;
          };
          const setSt = (rid, html) => { const c = tb.querySelector('tr[data-id="' + rid + '"] [data-st]'); if (c) c.innerHTML = html; };
          const note = (cls, label, html) => {
            const d = document.createElement('div');
            d.className = 'note-card note-card--' + cls;
            d.innerHTML = '<small>' + label + '</small>' + html;
            extra.appendChild(d);
            wrap.scrollTop = wrap.scrollHeight;
          };
          const tap = async (sel) => {
            const t = scr.querySelector(sel);
            if (t) {
              const pr = phone.getBoundingClientRect(), r = t.getBoundingClientRect();
              tapEl.style.left = (r.left + r.width / 2 - pr.left) + 'px';
              tapEl.style.top = (r.top + r.height / 2 - pr.top) + 'px';
              tapEl.classList.remove('is-on'); void tapEl.offsetWidth; tapEl.classList.add('is-on');
            }
            await w(380);
          };
          const ml = async (html, ms) => { addLine(mlog, html); await w(ms == null ? 260 : ms); };
          const OK = '<div class="msg msg--ok">Payment accepted</div>';
          const passAuto = chip('pass', 'pass') + chip('auto', 'auto');

          sStage(0);
          note('story', 'User story', 'As a beneficiary, I pay a merchant with my meal voucher.');
          await w(1000);

          sStage(1);
          const cases = [['TC-01', 'Log in with a valid PIN'], ['TC-02', 'Balance shown after login'], ['TC-03', 'Pay within the balance'], ['TC-04', 'Pay above the balance shows an error']];
          for (const [rid, t] of cases) { row(rid, t, chip('todo', 'to run')); await w(320); }
          await w(300);

          sStage(2);
          mode.textContent = 'manual run'; mode.className = 'mob__mode is-manual';
          setSt('TC-01', chip('run', 'running'));
          for (let p = 1; p <= 4; p++) { show('login', { pin: p }); await w(170); }
          await tap('[data-t=login]'); show('home'); await w(500);
          setSt('TC-01', chip('pass', 'pass')); setSt('TC-02', chip('pass', 'pass')); await w(300);
          setSt('TC-03', chip('run', 'running'));
          await tap('[data-t=pay]'); show('pay'); await w(300);
          show('pay', { amt: '30.00' }); await w(350);
          await tap('[data-t=confirm]'); show('pay', { amt: '30.00', msg: OK }); await w(550);
          setSt('TC-03', chip('pass', 'pass'));
          show('home', { bal: '12.00' }); await w(450);
          setSt('TC-04', chip('run', 'running'));
          await tap('[data-t=pay]'); show('pay'); await w(250);
          show('pay', { amt: '60.00' }); await w(350);
          await tap('[data-t=confirm]'); await w(250);
          await tap('[data-t=confirm]'); await w(450);

          sStage(3, 'bad');
          setSt('TC-04', chip('fail', 'fail'));
          note('bug', 'Bug · Jira', 'No error message when the amount exceeds the balance.<span>Major · steps + screen recording attached</span>');
          await w(1200);

          sStage(4);
          note('ai', 'AI testing agent · PoC', 'Drafted 3 more cases from the user story.');
          await w(500);
          const ai = [['TC-05', 'Pay exactly the full balance'], ['TC-06', 'Pay with an expired voucher'], ['TC-07', 'Network loss during payment']];
          for (const [rid, t] of ai) { row(rid, t, chip('ai', 'AI draft')); await w(320); }
          await w(400);
          for (const [rid] of ai) { setSt(rid, chip('todo', 'reviewed')); await w(200); }

          sStage(5);
          mode.textContent = 'Appium · UiAutomator2'; mode.className = 'mob__mode is-auto';
          show('login');
          await ml(T('dim', '$ ') + 'appium session · Android emulator', 450);
          await ml(T('fn', 'setValue') + ' ~pin_input ' + T('str', '"••••"'), 120);
          for (let p = 1; p <= 4; p++) { show('login', { pin: p }); await w(80); }
          await ml(T('fn', 'tap') + ' ~login_button', 60); await tap('[data-t=login]'); show('home');
          await ml(T('fn', 'expect') + ' ~balance ' + T('dim', 'toBeDisplayed'), 200);
          setSt('TC-01', passAuto); setSt('TC-02', passAuto);
          await ml(T('ok', '✓') + ' TC-01 · TC-02', 250);
          await ml(T('fn', 'tap') + ' ~pay_button', 60); await tap('[data-t=pay]'); show('pay', { amt: '30.00' });
          await ml(T('fn', 'tap') + ' ~confirm_button', 60); await tap('[data-t=confirm]'); show('pay', { amt: '30.00', msg: OK });
          setSt('TC-03', passAuto);
          await ml(T('ok', '✓') + ' TC-03', 350);
          await ml(T('dim', 'UiPath: same flow prototyped as a mobile automation'), 350);
          addLine(mlog, '<span class="sum">' + T('ok', '3 cases automated') + T('dim', ' · TC-04 waits for the fix') + '</span>');
        },
      },
    };

    const SCREENS = {
      login: (o) => '<div class="scr"><small class="scr__app">Voucher wallet</small><h5>Enter your PIN</h5><div class="pin">' +
        [0, 1, 2, 3].map((i) => '<i' + (i < (o.pin || 0) ? ' class="on"' : '') + '></i>').join('') +
        '</div><div class="scr__btn" data-t="login">Log in</div></div>',
      home: (o) => '<div class="scr"><small class="scr__app">Voucher wallet</small><h5>My vouchers</h5>' +
        '<div class="vcard"><small>Meal voucher</small><b>' + (o.bal || '42.00') + ' TND</b></div>' +
        '<div class="row2"><div class="scr__btn" data-t="pay">Pay</div><div class="scr__ghost">History</div></div></div>',
      pay: (o) => '<div class="scr"><small class="scr__app">Pay a merchant</small><h5>Amount</h5>' +
        '<div class="field">' + (o.amt ? o.amt : '<span class="ph">0.00</span>') + ' TND</div>' + (o.msg || '') +
        '<div class="scr__btn" data-t="confirm">Confirm</div></div>',
    };

    function load(key) {
      simId++;
      current = key;
      tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.simTab === key)));
      const s = SIMS[key];
      sStages.innerHTML = s.stages.map((n) => '<li><span class="st"></span>' + n + '</li>').join('');
      lTab.innerHTML = s.ltab;
      rTab.innerHTML = s.rtab;
      s.build();
    }
    async function start() {
      const id = ++simId;
      SIMS[current].build();
      $$('li', sStages).forEach((li) => li.classList.remove('is-done', 'is-active', 'is-heal'));
      try {
        await SIMS[current].play(id);
        $$('li', sStages).forEach((li) => { li.classList.remove('is-active', 'is-heal'); li.classList.add('is-done'); });
      } catch (e) { /* cancelled */ }
      if (id === simId) $$('.caret', sim).forEach((c) => c.remove());
    }
    playSim = (key) => { if (key && key !== current) load(key); start(); };

    tabs.forEach((t) => t.addEventListener('click', () => { simObs.disconnect(); load(t.dataset.simTab); start(); }));
    $('[data-sim-play]', sim).addEventListener('click', () => { simObs.disconnect(); start(); });
    load('redion');
    const simObs = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { simObs.disconnect(); start(); }
    }, { threshold: 0.35 });
    simObs.observe(sim);
  }

  /* =========================================================
     Project case studies (modal)
     ========================================================= */
  const GH = 'https://github.com/Mejri1/';
  const PROJECTS = {
    spec2test: {
      meta: 'Talan Tunisia · Final-year engineering project · 02/2026 – 06/2026',
      title: 'Spec-to-Playwright AI platform',
      lead: 'Specs are already written in plain language. This platform turns them into executable Playwright tests.',
      stats: [['20.8×', 'faster test creation'], ['90%', 'pass rate on functional scenarios']],
      built: [
        'LLM agent pipeline: spec analysis → test generation → execution.',
        'Playwright (JavaScript) + Cucumber/Gherkin output, so the requirement stays readable.',
        'Adaptive element resolution to survive UI changes.',
        'Reports, traces and Langfuse observability on every run.',
      ],
      stack: ['LLM agents', 'Playwright', 'JavaScript', 'Cucumber / Gherkin', 'Langfuse'],
      private: 'Built for Talan Tunisia. The source code is proprietary.',
    },
    selfheal: {
      meta: 'Open source · 2026',
      title: 'Self-healing test validation',
      lead: 'Gherkin in, Selenium scripts out, run in a real browser, with broken locators repaired on the fly.',
      built: [
        'LangGraph agents: Explorer, Analyst, Script Writer, Executor, Self-Healer, Reporter.',
        'On a failed locator, the Self-Healer reads the live DOM, ranks alternatives, patches and re-runs.',
        'HTML/JSON reports with a screenshot per step.',
        'Swappable LLM provider (Groq, Cerebras or local LM Studio).',
      ],
      stack: ['Python', 'LangGraph', 'Selenium 4', 'BeautifulSoup'],
      links: [['View on GitHub', GH + 'Functional-Test-Validation-System-']],
    },
    contract: {
      meta: 'Open source · 2026',
      title: 'AI-assisted API contract testing',
      lead: 'Contract tests break for good and bad reasons. An LLM explains the failure; deterministic rules decide if a fix is safe.',
      built: [
        'FastAPI service with JSON contract tests on fields, types and enums.',
        'LLM failure analyser that proposes a structured fix.',
        'Guardrails that only accept backward-compatible changes, then re-validate.',
        'Structured JSON logs of every decision.',
      ],
      stack: ['Python', 'FastAPI', 'pytest', 'LM Studio'],
      links: [['View on GitHub', GH + 'AI-test']],
    },
    crew: {
      meta: 'Open source · 2025',
      title: 'Multi-agent data science crew',
      lead: 'From a business question and a CSV to a technical report.',
      built: [
        'Four CrewAI agents: Planner, Data Analyst, Modeller, Report Writer.',
        'Custom tools to read CSVs and compute dataset statistics.',
        'LLaMA via Hugging Face; output is a Markdown report.',
      ],
      stack: ['Python', 'CrewAI', 'LLaMA', 'Hugging Face'],
      links: [['View on GitHub', GH + 'Agentic-IA']],
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
    const card = e.target.closest('[data-project]');
    if (card && !e.target.closest('a, button, .runner')) openProject(card.dataset.project);
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
    { g: 'Navigate', label: 'Experience', icon: 'u-arrow', run: go('experience'), hint: '01' },
    { g: 'Navigate', label: 'Missions', icon: 'u-arrow', run: go('missions'), hint: '02' },
    { g: 'Navigate', label: 'Projects', icon: 'u-arrow', run: go('projects'), hint: '03' },
    { g: 'Navigate', label: 'Stack', icon: 'u-arrow', run: go('stack'), hint: '04' },
    { g: 'Navigate', label: 'Education & certifications', icon: 'u-arrow', run: go('education'), hint: '05' },
    { g: 'Navigate', label: 'Contact', icon: 'u-arrow', run: go('contact'), hint: '06' },
    { g: 'Actions', label: 'Download CV (PDF)', icon: 'u-download', run: () => { const a = document.createElement('a'); a.href = CV; a.download = 'Omar_Mejri_CV.pdf'; document.body.appendChild(a); a.click(); a.remove(); } },
    { g: 'Actions', label: 'Copy email address', icon: 'u-copy', run: () => copy(EMAIL), hint: EMAIL },
    { g: 'Actions', label: 'Write an email', icon: 'u-mail', run: () => { location.href = 'mailto:' + EMAIL; } },
    { g: 'Actions', label: 'Open LinkedIn', icon: 'u-linkedin', run: openUrl('https://www.linkedin.com/in/omar-mejri/') },
    { g: 'Actions', label: 'Open GitHub', icon: 'i-github', run: openUrl('https://github.com/Mejri1') },
    { g: 'Actions', label: 'Toggle light / dark theme', icon: 'u-sun', run: toggleTheme },
    { g: 'Actions', label: 'Play the Redion mission (Azure DevOps)', icon: 'u-replay', run: () => { go('missions')(); setTimeout(() => playSim('redion'), 500); } },
    { g: 'Actions', label: 'Play the Upcoop mission (Appium)', icon: 'u-replay', run: () => { go('missions')(); setTimeout(() => playSim('upcoop'), 500); } },
    { g: 'Actions', label: 'Replay the spec-to-test demo', icon: 'u-replay', run: () => { go('projects')(); setTimeout(run, 500); } },
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
