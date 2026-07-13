'use strict';

/* ═══════════════════════════════════════════════════════════════════════════
   ESTADO GLOBAL
══════════════════════════════════════════════════════════════════════════════ */
let zTop    = 10;
const WINS  = {};       // id → elemento DOM
let active  = null;     // janela com foco
let dragging  = null;   // { el, ox, oy }
let resizing  = null;   // { el, ox, oy, w0, h0 }
const zoomed  = {};     // id → boolean

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIGURAÇÃO DAS JANELAS
   width/height/x/y são valores iniciais — podem ser alterados livremente
══════════════════════════════════════════════════════════════════════════════ */
const CFG = {
  get finder()   { return { title:t('win_finder'),  w:540, h:360, x:60,  y:30,  status:t('finder_status'),  cls:'',        build: bFinder   }; },
  get about()    { return { title:t('win_about'),   w:450, h:480, x:100, y:45,  status:t('about_wbar'),     cls:'',        build: bAbout    }; },
  get projects() { return { title:t('win_projects'),w:540, h:480, x:140, y:60,  status:t('proj_status_loading'), cls:'',   build: bProjects }; },
  get skills()   { return { title:t('win_skills'),  w:410, h:430, x:180, y:75,  status:'',                  cls:'',        build: bSkills   }; },
  get contact()  { return { title:t('win_contact'), w:410, h:460, x:160, y:85,  status:t('ct_wbar'),        cls:'',        build: bContact  }; },
  get terminal() { return { title:t('win_terminal') + ' — bash', w:530, h:350, x:110, y:70, status:'bash 80×24', cls:'terminal', build: bTerminal }; },
  get trash()    { return { title:t('win_trash'),   w:320, h:200, x:240, y:150, status:t('trash_status'),   cls:'',        build: bTrash    }; },
  get pacman()   { return { title:'Pac-Man',         w:400, h:470, x:120, y:40,  status:t('pacman_status'),  cls:'',        build: bPacman   }; },
  get mario()    { return { title:'Super Mario Bros',w:430, h:310, x:150, y:50,  status:t('mario_status'),   cls:'',        build: bMario    }; },
};

/* ═══════════════════════════════════════════════════════════════════════════
   GESTÃO DE JANELAS
══════════════════════════════════════════════════════════════════════════════ */
function openWin(id) {
  deselectIcons(); closeMenus();
  if (WINS[id]) { focusWin(id); return; }
  const c = CFG[id]; if (!c) return;

  const el = document.createElement('div');
  el.className = 'win off' + (c.cls ? ' ' + c.cls : '');
  el.id = 'win-' + id;
  el.style.cssText = `width:${c.w}px;height:${c.h}px;left:${c.x}px;top:${c.y}px;z-index:${++zTop}`;

  el.innerHTML = `
    <div class="wtb">
      <div class="wtb-bg"></div>
      <div class="wbtn wclose" data-act="close" data-id="${id}"></div>
      <div class="wtitle">${c.title}</div>
      <div class="wbtn wzoom"  data-act="zoom"  data-id="${id}"></div>
    </div>
    <div class="wbody">
      <div class="wscroll" id="ws-${id}">${c.build()}</div>
    </div>
    <div class="wbar">
      <span>${c.status}</span>
      <div class="wresize" data-id="${id}"></div>
    </div>`;

  document.getElementById('desktop').appendChild(el);
  WINS[id] = el;
  focusWin(id);
  if (id === 'terminal') setTimeout(runTerminal, 220);
  if (id === 'projects') setTimeout(loadProjectsGH, 120);
  if (id === 'pacman')   setTimeout(initPacman, 100);
  if (id === 'mario')    setTimeout(initMario,  100);
}

function focusWin(id) {
  Object.values(WINS).forEach(w => w.classList.add('off'));
  if (!WINS[id]) return;
  WINS[id].classList.remove('off');
  WINS[id].style.zIndex = ++zTop;
  active = id;
}

function closeWin(id) {
  if (!WINS[id]) return;
  WINS[id].remove();
  delete WINS[id];
  delete zoomed[id];
  if (active === id) active = null;
}

function closeActive() { if (active) closeWin(active); closeMenus(); }

function toggleZoom(id) {
  const el = WINS[id]; if (!el) return;
  const c = CFG[id];
  const desk = document.getElementById('desktop');
  if (zoomed[id]) {
    el.style.width  = c.w + 'px'; el.style.height = c.h + 'px';
    el.style.left   = c.x + 'px'; el.style.top    = c.y + 'px';
    zoomed[id] = false;
  } else {
    el.style.width  = (desk.clientWidth  - 100) + 'px';
    el.style.height = (desk.clientHeight - 30)  + 'px';
    el.style.left = '8px'; el.style.top = '8px';
    zoomed[id] = true;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   DRAG & RESIZE
══════════════════════════════════════════════════════════════════════════════ */
document.addEventListener('mousedown', e => {
  const winEl = e.target.closest('.win');
  if (winEl) focusWin(winEl.id.slice(4));

  if (e.target.dataset.act === 'close') { closeWin(e.target.dataset.id); return; }
  if (e.target.dataset.act === 'zoom')  { toggleZoom(e.target.dataset.id); return; }

  const rh = e.target.closest('.wresize');
  if (rh) {
    const el = WINS[rh.dataset.id]; if (!el) return;
    resizing = { el, ox:e.clientX, oy:e.clientY, w0:el.offsetWidth, h0:el.offsetHeight };
    e.preventDefault(); return;
  }

  const tb = e.target.closest('.wtb');
  if (tb && !e.target.dataset.act) {
    const id = tb.querySelector('[data-id]')?.dataset.id;
    const el = id && WINS[id]; if (!el) return;
    dragging = { el, ox: e.clientX - el.offsetLeft, oy: e.clientY - el.offsetTop };
    e.preventDefault();
  }
});

document.addEventListener('mousemove', e => {
  if (dragging) {
    dragging.el.style.left = Math.max(0, e.clientX - dragging.ox) + 'px';
    dragging.el.style.top  = Math.max(0, e.clientY - dragging.oy) + 'px';
  }
  if (resizing) {
    resizing.el.style.width  = Math.max(240, resizing.w0 + e.clientX - resizing.ox) + 'px';
    resizing.el.style.height = Math.max(150, resizing.h0 + e.clientY - resizing.oy) + 'px';
  }
});
document.addEventListener('mouseup', () => { dragging = null; resizing = null; });

/* ═══════════════════════════════════════════════════════════════════════════
   ÍCONES DO DESKTOP
══════════════════════════════════════════════════════════════════════════════ */
function selectIcon(el) { deselectIcons(); el.classList.add('sel'); }
function deselectIcons() {
  document.querySelectorAll('.icon').forEach(i => i.classList.remove('sel'));
}

/* ═══════════════════════════════════════════════════════════════════════════
   MENU BAR
══════════════════════════════════════════════════════════════════════════════ */
document.querySelectorAll('[data-dd]').forEach(item => {
  item.addEventListener('click', e => {
    e.stopPropagation();
    const dd = document.getElementById(item.dataset.dd);
    const wasOpen = dd.classList.contains('show');
    closeMenus();
    if (!wasOpen) {
      dd.style.left = item.getBoundingClientRect().left + 'px';
      dd.classList.add('show');
      item.classList.add('open');
    }
  });
});

function closeMenus() {
  document.querySelectorAll('.dd').forEach(d => d.classList.remove('show'));
  document.querySelectorAll('.mb').forEach(m => m.classList.remove('open'));
}

/* ─── Context menu ───────────────────────────────────────────────────────── */
document.getElementById('desktop').addEventListener('contextmenu', e => {
  e.preventDefault();
  const ctx = document.getElementById('ctx');
  ctx.style.left = e.clientX + 'px';
  ctx.style.top  = e.clientY + 'px';
  ctx.classList.add('show');
});

document.addEventListener('click', e => {
  closeMenus();
  document.getElementById('ctx').classList.remove('show');
  if (!e.target.closest('.icon')) deselectIcons();
});

/* ─── Teclado ────────────────────────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'w') { e.preventDefault(); closeActive(); }
});

/* ─── Relógio ────────────────────────────────────────────────────────────── */
function tick() {
  const n = new Date();
  document.getElementById('mb-clock').textContent =
    String(n.getHours()).padStart(2,'0') + ':' + String(n.getMinutes()).padStart(2,'0');
}
tick(); setInterval(tick, 15000);

/* ═══════════════════════════════════════════════════════════════════════════
   DIÁLOGOS
══════════════════════════════════════════════════════════════════════════════ */
function getDlgs() {
  return {
    'about-sys': {
      ico: '🖥',
      msg: t('dlg_about_sys_msg'),
      btns: [{ l:t('dlg_ok'), primary:true, fn:'closeDlg()' }]
    },
    restart: {
      ico: '💾',
      msg: t('dlg_restart_msg'),
      btns: [
        { l:t('dlg_cancel'), fn:'closeDlg()' },
        { l:t('dlg_restart_btn'), primary:true, fn:'closeDlg();location.reload()' }
      ]
    }
  };
}

function openDlg(key) {
  const d = getDlgs()[key]; if (!d) return; closeMenus();
  document.getElementById('dlg-ico').textContent = d.ico;
  document.getElementById('dlg-msg').innerHTML   = d.msg;
  document.getElementById('dlg-row').innerHTML   = d.btns
    .map(b => `<button class="macbtn${b.primary?' primary':''}" onclick="${b.fn}">${b.l}</button>`)
    .join('');
  document.getElementById('overlay').classList.add('show');
}
function closeDlg() { document.getElementById('overlay').classList.remove('show'); }

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTRUTORES DE CONTEÚDO
══════════════════════════════════════════════════════════════════════════════ */

/* ── Portfolio HD (Finder) ──────────────────────────────────────────────── */
function bFinder() {
  const items = [
    { emoji:'👤', label:t('win_about'),   win:'about'    },
    { emoji:'📁', label:t('win_projects'),win:'projects' },
    { emoji:'⚙️', label:t('win_skills'),  win:'skills'   },
    { emoji:'✉️', label:t('win_contact'), win:'contact'  },
    { emoji:'⌨️', label:t('win_terminal'),win:'terminal' },
    { emoji:'🕹', label:'Pac-Man',        win:'pacman'   },
    { emoji:'🍄', label:'Mario Bros',     win:'mario'    },
  ];
  return `
    <div class="finder-toolbar">
      <span style="font-size:16px">📂</span>
      <strong>${t('finder_toolbar_title')}</strong>
      <span style="margin-left:auto;color:#666">${t('finder_toolbar_count')}</span>
    </div>
    <div class="finder-grid">
      ${items.map(i => `
        <div class="finder-item" ondblclick="openWin('${i.win}')">
          <span style="font-size:28px">${i.emoji}</span>
          <span>${i.label}</span>
        </div>`).join('')}
    </div>`;
}

/* ── ABOUT ME ───────────────────────────────────────────────────────────── */
function bAbout() {
  return `
    <div class="av-hdr">
      <div class="av-photo">👨‍💻</div>
      <div>
        <div class="av-name">David Arsénio Martins</div>
        <div class="av-role">${t('about_role')} <span style="font-weight:normal;color:#888">— ${t('about_tagline')}</span></div>
        <div class="av-badges">
          <span class="av-badge">${t('badge_location')}</span>
          <span class="av-badge">${t('badge_photo')}</span>
          <span class="av-badge">${t('badge_open')}</span>
        </div>
      </div>
    </div>

    <div class="about-body">
      <div style="margin-bottom:16px">
        <div class="stitle">${t('stitle_bio')}</div>
        <p class="about-bio">${t('about_bio_1')}</p>
        <p class="about-bio" style="margin-top:10px">${t('about_bio_2')}</p>
        <p class="about-bio" style="margin-top:10px">${t('about_bio_3')}</p>
      </div>

      <div style="margin-bottom:16px">
        <div class="stitle">${t('stitle_journey')}</div>
        <div class="timeline">
          <div class="tl-item">
            <div class="tl-role">${t('j3_role')}</div>
            <div class="tl-where">${t('j3_where')}</div>
            <div class="tl-desc">${t('j3_desc')}</div>
          </div>
          <div class="tl-item">
            <div class="tl-role">${t('j2_role')}</div>
            <div class="tl-where">${t('j2_where')}</div>
            <div class="tl-desc">${t('j2_desc')}</div>
          </div>
          <div class="tl-item">
            <div class="tl-role">${t('j1_role')}</div>
            <div class="tl-where">${t('j1_where')}</div>
            <div class="tl-desc">${t('j1_desc')}</div>
          </div>
        </div>
      </div>

      <div style="margin-bottom:16px">
        <div class="stitle">${t('stitle_education')}</div>
        <div class="timeline">
          <div class="tl-item">
            <div class="tl-role">${t('edu2_role')}</div>
            <div class="tl-where">${t('edu2_where')}</div>
          </div>
          <div class="tl-item">
            <div class="tl-role">${t('edu1_role')}</div>
            <div class="tl-where">${t('edu1_where')}</div>
          </div>
        </div>
      </div>

      <div style="margin-bottom:16px">
        <div class="stitle">${t('stitle_tech_skills')}</div>
        <div class="tools-grid" style="margin-top:6px">
          <span class="tag">Java</span>
          <span class="tag">JavaScript</span>
          <span class="tag">TypeScript</span>
          <span class="tag">React</span>
          <span class="tag">Next.js</span>
          <span class="tag">Node.js</span>
          <span class="tag">Kotlin</span>
          <span class="tag">Swift</span>
        </div>
        <div style="margin-top:8px;font-size:11px;color:#666">
          <a href="#" onclick="openWin('skills');return false;" style="color:#3377CC;text-decoration:underline">${t('see_full_skills')}</a>
        </div>
      </div>

      <div style="margin-bottom:16px">
        <div class="stitle">${t('stitle_current_portfolio')}</div>
        <p style="font-size:11px;line-height:1.7;color:#333">
          ${t('current_portfolio_note')}
          <a href="https://ividi.dev/" target="_blank" style="color:#3377CC;text-decoration:underline">ividi.dev ↗</a>
        </p>
      </div>

      <div style="padding-top:4px;display:flex;gap:10px;flex-wrap:wrap">
        <a class="macbtn primary" href="https://ividi.dev/CV_DAM2026_en.pdf" target="_blank">${t('btn_download_cv')}</a>
        <a class="macbtn" href="#" onclick="openWin('contact');return false;">${t('btn_contact')}</a>
      </div>
    </div>`;
}

/* ── PROJECTS ───────────────────────────────────────────────────────────── */
/* ── PROJECTS — carrega do GitHub ───────────────────────────────────────── */
function bProjects() {
  return `
    <div id="gh-loading" style="display:flex;align-items:center;justify-content:center;
         gap:10px;padding:50px 0;color:#888;font-size:12px">
      <div style="width:14px;height:14px;border:2px solid #ccc;border-top-color:#3377CC;
           border-radius:50%;animation:ghspin .8s linear infinite;flex-shrink:0"></div>
      ${t('proj_loading')}
    </div>
    <div id="gh-error" style="display:none;padding:12px;color:#c00;font-size:12px;
         border:1px solid #faa;background:#fff5f5;margin-bottom:8px"></div>
    <div id="gh-list"></div>`;
}

/* ── GitHub helpers ──────────────────────────────────────────────────────── */
const GH_USER = 'VidiPT89';

const LANG_COLORS = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', HTML: '#e34c26',
  CSS: '#563d7c', Swift: '#F05138', Java: '#b07219',
  Kotlin: '#A97BFF', Python: '#3572A5',
};

/* linguagens que correm no browser */
const WEB_LANGS = new Set(['JavaScript', 'TypeScript', 'HTML', 'CSS']);

function repoEmoji(r) {
  const n = r.name.toLowerCase();
  const games = ['spaceinvaders','pacman','frogger','memoria','pedrapapeloutesoura','10x10','4exercises'];
  if (games.includes(n))             return '🎮';
  if (r.language === 'Swift')        return '🍎';
  if (r.language === 'Java' || r.language === 'Kotlin') return '🤖';
  if (n.includes('dashboard'))       return '📊';
  if (n.includes('api') || n.includes('backend')) return '⚙️';
  return '📁';
}

function fmtName(name) {
  return name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function renderGHRepo(r) {
  const lang  = r.language || '';
  const color = LANG_COLORS[lang] || '#aaa';
  const raw   = r.homepage || '';
  const demo  = raw ? (raw.startsWith('http') ? raw : 'https://' + raw) : '';
  const year  = new Date(r.updated_at).getFullYear();
  const ghUrl = r.html_url;

  /* URL para "Executar": homepage > GitHub Pages */
  const ghPages = `https://${GH_USER.toLowerCase()}.github.io/${r.name}`;
  const canRun  = demo || (WEB_LANGS.has(lang) && lang !== 'CSS');
  const runUrl  = demo || ghPages;

  const safe = (s) => s.replace(/'/g, "\\'");

  return `
    <div class="proj">
      <div class="proj-hdr">
        <div class="proj-name">
          ${repoEmoji(r)} ${fmtName(r.name)}
          ${r.fork ? '<span style="font-size:9px;color:#888;border:1px solid #ccc;padding:0 4px;margin-left:4px;background:#f5f5f5">fork</span>' : ''}
        </div>
        <span class="proj-year">${year}</span>
      </div>

      ${r.description
        ? `<div class="proj-desc">${r.description}</div>`
        : `<div class="proj-desc" style="color:#bbb;font-style:italic">${t('proj_no_desc')}</div>`}

      ${lang ? `<div class="tags" style="margin-bottom:7px">
        <span class="tag">
          <span style="display:inline-block;width:9px;height:9px;border-radius:50%;
               background:${color};margin-right:4px;vertical-align:middle"></span>${lang}
        </span>
      </div>` : ''}

      <div class="proj-links" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <a href="${ghUrl}" target="_blank">⬡ GitHub</a>
        ${demo ? `<a href="${demo}" target="_blank">↗ Live Demo</a>` : ''}
        ${canRun
          ? `<button class="macbtn" style="padding:2px 10px;font-size:10px"
               onclick="openProjectWin('${safe(r.name)}','${safe(fmtName(r.name))}','${safe(runUrl)}')">
               ${t('proj_run_btn')}
             </button>`
          : ''}
      </div>
    </div>`;
}

async function loadProjectsGH() {
  const list    = document.getElementById('gh-list');
  const loading = document.getElementById('gh-loading');
  const errBox  = document.getElementById('gh-error');
  if (!list) return;

  try {
    const res   = await fetch(`https://api.github.com/users/${GH_USER}/repos?sort=updated&per_page=100`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const repos = await res.json();

    loading.style.display = 'none';

    const mine  = repos.filter(r => !r.fork && r.name !== GH_USER);
    const forks = repos.filter(r => r.fork);

    let html = '';
    if (mine.length) {
      html += `<div style="font-size:10px;font-weight:bold;text-transform:uppercase;
                   letter-spacing:.06em;color:#666;border-bottom:1px solid #ccc;
                   padding-bottom:3px;margin-bottom:8px">
                 ${t('proj_mine_section')} (${mine.length})
               </div>`;
      html += mine.map(renderGHRepo).join('');
    }
    if (forks.length) {
      html += `<div style="font-size:10px;font-weight:bold;text-transform:uppercase;
                   letter-spacing:.06em;color:#666;border-bottom:1px solid #ccc;
                   padding-bottom:3px;margin:14px 0 8px">
                 ${t('proj_forks_section')} (${forks.length})
               </div>`;
      html += forks.map(renderGHRepo).join('');
    }

    list.innerHTML = html;

    const bar = document.querySelector('#win-projects .wbar span');
    if (bar) bar.textContent = `${mine.length} ${t('proj_count_projects')} · ${forks.length} ${t('proj_count_forks')} — github.com/${GH_USER}`;

  } catch (err) {
    loading.style.display = 'none';
    errBox.style.display  = 'block';
    errBox.textContent    = t('proj_error_prefix') + err.message;
  }
}

/* ── Abre projeto em janela iframe ───────────────────────────────────────── */
function openProjectWin(id, name, url) {
  const winId = 'run-' + id;
  if (WINS[winId]) { focusWin(winId); return; }

  const el = document.createElement('div');
  el.className = 'win off';
  el.id = 'win-' + winId;
  el.style.cssText =
    `width:780px;height:560px;left:${80 + Object.keys(WINS).length * 20}px;top:40px;z-index:${++zTop}`;

  el.innerHTML = `
    <div class="wtb">
      <div class="wtb-bg"></div>
      <div class="wbtn wclose" data-act="close" data-id="${winId}"></div>
      <div class="wtitle">▶ ${name}</div>
      <div class="wbtn wzoom"  data-act="zoom"  data-id="${winId}"></div>
    </div>
    <div class="wbody" style="overflow:hidden;padding:0">
      <iframe
        id="iframe-${winId}"
        src="${url}"
        style="width:100%;height:100%;border:none;display:block;flex:1"
        allow="fullscreen"
      ></iframe>
    </div>
    <div class="wbar">
      <span>
        <a href="${url}" target="_blank"
           style="color:#3377CC;text-decoration:underline">${url}</a>
      </span>
      <div class="wresize" data-id="${winId}"></div>
    </div>`;

  document.getElementById('desktop').appendChild(el);
  WINS[winId] = el;
  focusWin(winId);
}

/* ── SKILLS ─────────────────────────────────────────────────────────────── */
const SKILL_CATEGORIES = [
  { key:'stitle_software_dev', tools:['Java','JavaScript','TypeScript','HTML/CSS','Bootstrap','React','Next.js','Node.js'] },
  { key:'stitle_database',     tools:['SQL / MySQL','MongoDB','Cloudflare','Neon'] },
  { key:'stitle_mobile',       tools:['Android','iOS','Kotlin','Swift','Android Studio','Xcode','TestFlight'] },
  { key:'stitle_tools_practices', tools:['Git','GitHub','Vercel','Docker','Jira','Figma','Notion','Canva','Visual Studio Code','Discord','Slack','Linux','Windows','macOS','Terminal','Agile','QA'] },
  { key:'stitle_office',       tools:['Word','Excel','PowerPoint','Outlook','Teams'] },
  { key:'stitle_photography',  tools:['Photoshop','Lightroom','Bridge','PhotoMechanic','Capture One'] },
];

function bSkills() {
  const cats = SKILL_CATEGORIES.map(c => `
    <div class="skills-cat">
      <div class="stitle">${t(c.key)}</div>
      <div class="tools-grid">${c.tools.map(tool => `<span class="tag">${tool}</span>`).join('')}</div>
    </div>`).join('');

  setTimeout(() => {
    const bar = document.querySelector('#win-skills .wbar span');
    if (bar) bar.textContent = `${t('skills_wbar_prefix')} ${t('skills_wbar_categories')}`;
  }, 0);

  return cats;
}

/* ── CONTACT ────────────────────────────────────────────────────────────── */
function bContact() {
  return `
    <p class="ct-intro">${t('ct_intro')}</p>

    <div class="stitle">${t('stitle_direct_contact')}</div>

    <div class="ct-row">
      <div class="ct-ico" style="font-size:20px">✉</div>
      <div>
        <div class="ct-lbl">${t('ct_lbl_email')}</div>
        <div class="ct-val"><a href="mailto:ividi.dev@gmail.com">ividi.dev@gmail.com</a></div>
      </div>
    </div>

    <div class="ct-row">
      <div class="ct-ico" style="font-size:13px;font-weight:bold;padding-top:4px">GH</div>
      <div>
        <div class="ct-lbl">${t('ct_lbl_github')}</div>
        <div class="ct-val"><a href="https://github.com/VidiPT89" target="_blank">github.com/VidiPT89</a></div>
      </div>
    </div>

    <div class="ct-row">
      <div class="ct-ico" style="font-size:14px;font-weight:bold;padding-top:4px">in</div>
      <div>
        <div class="ct-lbl">${t('ct_lbl_linkedin')}</div>
        <div class="ct-val"><a href="https://www.linkedin.com/in/david-martins-9b0129270/" target="_blank">david-martins-9b0129270</a></div>
      </div>
    </div>

    <div class="ct-row">
      <div class="ct-ico" style="font-size:15px">🌐</div>
      <div>
        <div class="ct-lbl">${t('ct_lbl_portfolio')}</div>
        <div class="ct-val"><a href="https://ividi.dev/" target="_blank">ividi.dev ↗</a></div>
      </div>
    </div>

    <div class="ct-note">${t('ct_note')}</div>

    <div class="ct-form" style="margin-top:18px">
      <div class="stitle">${t('stitle_send_message')}</div>
      <label>${t('ct_lbl_name')}</label>
      <input type="text" placeholder="${t('ct_placeholder_name')}">
      <label>${t('ct_lbl_email')}</label>
      <input type="email" placeholder="${t('ct_placeholder_email')}">
      <label>${t('ct_lbl_message')}</label>
      <textarea rows="4" placeholder="${t('ct_placeholder_message')}"></textarea>
      <button class="macbtn primary"
        onclick="alert('${t('ct_send_alert')}')">
        ${t('ct_send_btn')}
      </button>
    </div>`;
}

/* ── TERMINAL ───────────────────────────────────────────────────────────── */
function bTerminal() {
  return `<div id="t-out" style="min-height:200px"></div>`;
}

/* ── TRASH ──────────────────────────────────────────────────────────────── */
function bTrash() {
  return `
    <div style="display:flex;flex-direction:column;align-items:center;
                justify-content:center;height:120px;gap:10px;color:#aaa;">
      <svg width="44" height="44" viewBox="0 0 32 32">
        <rect x="8" y="10" width="16" height="18" rx="1" fill="#eee" stroke="#ccc" stroke-width="1.5"/>
        <rect x="5" y="8"  width="22" height="3"  rx="1" fill="#eee" stroke="#ccc" stroke-width="1.5"/>
        <rect x="12" y="3" width="8"  height="6"  rx="1" fill="#eee" stroke="#ccc" stroke-width="1.5"/>
        <line x1="12" y1="14" x2="12" y2="25" stroke="#ccc" stroke-width="1"/>
        <line x1="16" y1="14" x2="16" y2="25" stroke="#ccc" stroke-width="1"/>
        <line x1="20" y1="14" x2="20" y2="25" stroke="#ccc" stroke-width="1"/>
      </svg>
      <span style="font-size:12px">${t('trash_empty_msg')}</span>
    </div>`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ANIMAÇÃO DO TERMINAL
   ← EDITAR: Altera as linhas abaixo para personalizar o teu "pitch" no terminal
   cls: 'cmd' = comando digitado  |  'out' = output normal  |  'warn' = amarelo
══════════════════════════════════════════════════════════════════════════════ */
const T_LINES = [
  { t:150,  cls:'cmd',  text:'whoami' },
  { t:400,  cls:'out',  text:'david.arsenio.martins  ·  software developer  ·  cascais, portugal' },
  { t:200,  cls:'',     text:'' },
  { t:300,  cls:'cmd',  text:'cat skills.txt' },
  { t:350,  cls:'out',  text:'Java · JavaScript · TypeScript · React · Next.js · Node.js' },
  { t:80,   cls:'out',  text:'Kotlin · Swift · SQL/MySQL · MongoDB · Docker · Git' },
  { t:200,  cls:'',     text:'' },
  { t:300,  cls:'cmd',  text:'ls -la projects/' },
  { t:350,  cls:'out',  text:'drwxr-xr-x  iBeyblade/    pacmanHD/    Xadrez/' },
  { t:80,   cls:'out',  text:'drwxr-xr-x  WebBeyblade/  froggerHD/   memoryHD/' },
  { t:200,  cls:'',     text:'' },
  { t:300,  cls:'cmd',  text:'cat status.txt' },
  { t:320,  cls:'warn', text:'✓  Open to new opportunities — software dev, freelance & collabs.  🚀' },
  { t:200,  cls:'',     text:'' },
  { t:300,  cls:'cmd',  text:"echo \"Let's build something great together!\"" },
  { t:320,  cls:'out',  text:"Let's build something great together!" },
  { t:200,  cls:'',     text:'' },
];

async function runTerminal() {
  const out = document.getElementById('t-out');
  if (!out) return;

  const ps1 = () =>
    `<span class="t-ps1">david@portfolio</span>` +
    `<span style="color:#444">:</span>` +
    `<span class="t-path">~</span>` +
    `<span class="t-ps1">$</span>`;

  for (const step of T_LINES) {
    await new Promise(r => setTimeout(r, step.t));
    const d = document.createElement('div');
    d.style.lineHeight = '1.55';

    if (step.cls === 'cmd') {
      d.innerHTML = `${ps1()} <span style="color:#eee">${step.text}</span>`;
    } else if (step.cls === 'out') {
      d.className = 't-out'; d.textContent = step.text;
    } else if (step.cls === 'warn') {
      d.className = 't-warn'; d.textContent = step.text;
    } else {
      d.innerHTML = '&nbsp;';
    }

    out.appendChild(d);
    const ws = document.getElementById('ws-terminal');
    if (ws) ws.scrollTop = ws.scrollHeight;
  }

  const cur = document.createElement('div');
  cur.style.lineHeight = '1.55';
  cur.innerHTML = `${ps1()} <span class="t-cursor"></span>`;
  out.appendChild(cur);
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUPER MARIO BROS
══════════════════════════════════════════════════════════════════════════════ */
function bMario() {
  return `
    <div id="mar-wrap" style="display:flex;flex-direction:column;align-items:center;gap:0;padding:0">
      <div style="display:flex;gap:14px;font-size:10px;font-family:monospace;
                  width:100%;justify-content:space-around;background:#5c94fc;
                  padding:3px 8px;color:#fff;border-bottom:2px solid #000">
        <span>MARIO <strong id="mar-score">000000</strong></span>
        <span>🍄×<strong id="mar-lives">3</strong></span>
        <span>COINS <strong id="mar-coins">00</strong></span>
        <span>WORLD 1-1</span>
      </div>
      <canvas id="mar-canvas" width="400" height="224"
              style="border-left:2px solid #000;border-right:2px solid #000;
                     border-bottom:2px solid #000;display:block;image-rendering:pixelated"></canvas>
      <div style="font-size:10px;color:#555;text-align:center;padding:3px 0">
        ${t('mario_hint')}
      </div>
    </div>`;
}

function initMario() {
  const canvas = document.getElementById('mar-canvas');
  if (!canvas) return;

  const W = 400, H = 224, T = 16;
  const ROWS = H / T;        // 14
  const MAP_W = 175;         // tiles wide
  const ctx = canvas.getContext('2d');

  /* ── Tilemap ─────────────────────────────────────────────────── */
  // 0=air 1=ground 2=brick 3=?block 4=?used 5=pipe-body 6=pipe-cap
  const map = Array.from({length: ROWS}, () => new Uint8Array(MAP_W));

  const gt = (c, r) => {
    if (c < 0 || c >= MAP_W || r < 0 || r >= ROWS) return 1;
    return map[r][c];
  };
  const st = (c, r, v) => { if (c>=0&&c<MAP_W&&r>=0&&r<ROWS) map[r][c]=v; };
  const solid = v => v !== 0;

  function buildLevel() {
    // Clear
    for (let r=0; r<ROWS; r++) map[r].fill(0);

    // Ground rows 12-13 (with gaps)
    const GAPS = [{s:28,e:30},{s:72,e:74},{s:138,e:140}];
    for (let c=0; c<MAP_W; c++) {
      if (GAPS.some(g => c>=g.s && c<=g.e)) continue;
      st(c,12,1); st(c,13,1);
    }

    // Platforms / blocks [col, row, width, type]
    [
      [3,9,1,3],[4,9,2,2],[6,9,1,3],   // ?-B-B-?
      [11,9,1,3],                         // lone ?
      [20,7,1,3],[21,7,2,2],[23,7,1,3], // mid triple
      [26,8,4,1],                         // solid platform near gap
      [38,7,1,3],[39,7,3,2],[42,7,1,3],
      [52,5,4,1],                         // high platform
      [61,8,5,1],                         // step platform
      [63,7,1,3],
      [85,7,1,3],[86,7,3,2],[89,7,1,3],
      [98,5,4,1],
      [112,9,2,2],[114,9,1,3],
      [122,7,4,1],
      [137,8,1,3],[138,8,3,2],[141,8,1,3],
    ].forEach(([c,r,w,t]) => { for (let i=0;i<w;i++) st(c+i,r,t); });

    // Pipes [col, height_in_tiles]
    [[17,2],[33,3],[48,2],[83,3],[105,2],[127,3],[146,2]].forEach(([c,h]) => {
      for (let i=0; i<h; i++) { st(c,11-i,5); st(c+1,11-i,5); }
      st(c,11-h,6); st(c+1,11-h,6);
    });
  }

  /* ── State ───────────────────────────────────────────────────── */
  let score, lives, coins, camX, ticks, raf;
  let gameState; // 'ready'|'playing'|'dead'|'win'|'gameover'
  let mario, goombas, floatCoins, particles;

  const COIN_SPAWNS = [
    [3,8],[6,8],[11,8],[20,6],[23,6],[38,6],[42,6],[63,6],
    [85,6],[89,6],[114,8],[137,7],[141,7]
  ];

  function resetEntities() {
    mario = { x:2*T, y:9*T, vx:0, vy:0, onGround:false,
              facing:1, frame:0, ft:0, dead:false, dt:0 };
    goombas = [10,23,43,57,80,103,120,135].map(col => ({
      x:col*T, y:10*T, vx:-0.8, alive:true, stomped:false, st:0
    }));
    floatCoins = COIN_SPAWNS.map(([c,r]) => ({x:c*T+4, y:r*T+8, alive:true}));
    particles = [];
    camX = 0;
  }

  function fullReset() {
    buildLevel();
    score=0; lives=3; coins=0;
    resetEntities();
    updateHUD();
  }

  function respawn() {
    // restore any used ? blocks for this run
    for (let r=0;r<ROWS;r++) for (let c=0;c<MAP_W;c++)
      if (map[r][c]===4) map[r][c]=3;
    resetEntities();
  }

  function updateHUD() {
    const s=document.getElementById('mar-score');
    const l=document.getElementById('mar-lives');
    const c=document.getElementById('mar-coins');
    if (s) s.textContent = String(score).padStart(6,'0');
    if (l) l.textContent = lives;
    if (c) c.textContent = String(coins).padStart(2,'0');
  }

  /* ── Input ───────────────────────────────────────────────────── */
  const K = {};
  function onKey(e) {
    if (!document.getElementById('mar-canvas')) {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('keyup',   onKeyUp);
      return;
    }
    K[e.code] = true;
    if (['Space','ArrowUp','ArrowLeft','ArrowRight','KeyZ','ShiftLeft','ShiftRight']
        .includes(e.code)) e.preventDefault();

    if (e.code === 'Enter') {
      if (gameState === 'ready')   { gameState = 'playing'; return; }
      if (gameState === 'dead') {
        lives--;
        if (lives <= 0) { gameState = 'gameover'; return; }
        respawn(); gameState = 'playing'; return;
      }
      if (gameState === 'gameover' || gameState === 'win') {
        fullReset(); gameState = 'playing';
      }
    }
  }
  function onKeyUp(e) { K[e.code] = false; }
  document.addEventListener('keydown', onKey);
  document.addEventListener('keyup',   onKeyUp);

  /* ── Physics ─────────────────────────────────────────────────── */
  function tileAt(px, py) { return gt(Math.floor(px/T), Math.floor(py/T)); }

  function moveMario() {
    const WALK=2.0, RUN=3.5, ACC=0.35, DEC=0.3, GRAV=0.45, MAXFALL=12;
    const run = K['ShiftLeft'] || K['ShiftRight'];
    const spd = run ? RUN : WALK;

    if (K['ArrowLeft'])       { mario.vx = Math.max(mario.vx-ACC,-spd); mario.facing=-1; }
    else if (K['ArrowRight']) { mario.vx = Math.min(mario.vx+ACC, spd); mario.facing= 1; }
    else mario.vx = mario.vx > 0 ? Math.max(0,mario.vx-DEC) : Math.min(0,mario.vx+DEC);

    if ((K['Space']||K['ArrowUp']||K['KeyZ']) && mario.onGround) {
      mario.vy = -9.5; mario.onGround = false;
    }
    mario.vy = Math.min(mario.vy + GRAV, MAXFALL);

    // Horizontal
    mario.x += mario.vx;
    mario.x = Math.max(0, mario.x);
    const mw=T-2, mh=T+4;
    const hpts = mario.vx>0
      ? [[mario.x+mw, mario.y+2],[mario.x+mw, mario.y+mh-2]]
      : [[mario.x,    mario.y+2],[mario.x,    mario.y+mh-2]];
    for (const [px,py] of hpts) {
      if (solid(tileAt(px,py))) {
        mario.x = mario.vx>0
          ? Math.floor(px/T)*T - mw - 1
          : Math.floor(px/T)*T + T + 1;
        mario.vx = 0; break;
      }
    }

    // Vertical
    mario.y += mario.vy;
    mario.onGround = false;
    if (mario.vy >= 0) {
      const fpts=[[mario.x+2,mario.y+mh],[mario.x+mw-2,mario.y+mh]];
      for (const [px,py] of fpts) {
        if (solid(tileAt(px,py))) {
          mario.y = Math.floor(py/T)*T - mh;
          mario.vy=0; mario.onGround=true; break;
        }
      }
    } else {
      const hd=[[mario.x+2,mario.y],[mario.x+mw-2,mario.y]];
      for (const [px,py] of hd) {
        const tc=Math.floor(px/T), tr=Math.floor(py/T);
        const tv=gt(tc,tr);
        if (solid(tv)) {
          mario.y = (tr+1)*T; mario.vy=1;
          if (tv===3) { st(tc,tr,4); coinPop(tc*T,tr*T); }
          break;
        }
      }
    }

    // Fall into gap
    if (mario.y > H+60) gameState='dead';

    // Flag pole (win)
    if (mario.x > (MAP_W-7)*T) { score+=2000; updateHUD(); gameState='win'; }
  }

  function coinPop(bx, by) {
    particles.push({x:bx+T/2, y:by-4, vy:-4.5, life:40, type:'coin'});
    score+=200; coins++; updateHUD();
  }

  function moveGoombas() {
    goombas.forEach(g => {
      if (!g.alive) return;
      if (g.stomped) { if(--g.st<=0) g.alive=false; return; }
      g.x += g.vx;
      if (solid(tileAt(g.x,     g.y+T-2))) g.vx= 0.8;
      if (solid(tileAt(g.x+T,   g.y+T-2))) g.vx=-0.8;
      g.vy = (g.vy||0)+0.4;
      g.y += Math.min(g.vy||0, 8);
      if (solid(tileAt(g.x+T/2, g.y+T))) {
        g.y = Math.floor((g.y+T)/T)*T-T; g.vy=0;
      }
      if (g.y > H+60) g.alive=false;
    });
  }

  function checkCollisions() {
    const mw=T-2, mh=T+4;
    goombas.forEach(g => {
      if (!g.alive||g.stomped) return;
      if (mario.x+mw>g.x+2 && mario.x<g.x+T-2 && mario.y+mh>g.y+2 && mario.y<g.y+T) {
        if (mario.vy>0 && mario.y+mh < g.y+T/2+4) {
          g.stomped=true; g.st=22; mario.vy=-5; score+=100; updateHUD();
        } else {
          gameState='dead';
        }
      }
    });
    floatCoins.forEach(c => {
      if (!c.alive) return;
      if (Math.abs(mario.x+T/2-c.x)<11 && Math.abs(mario.y+T/2-c.y)<11) {
        c.alive=false; score+=100; coins++; updateHUD();
        particles.push({x:c.x, y:c.y, vy:-3, life:28, type:'coin'});
      }
    });
  }

  /* ── Drawing ─────────────────────────────────────────────────── */
  function drawBG() {
    ctx.fillStyle='#5c94fc'; ctx.fillRect(0,0,W,H);
    // scrolling clouds (parallax 0.3)
    [[30,1],[90,3],[160,1],[230,2],[300,3],[360,1]].forEach(([cx,cy]) => {
      const sx = ((cx*T - camX*0.3) % (MAP_W*T*0.3 + W) + W) % W;
      ctx.fillStyle='rgba(255,255,255,0.92)';
      ctx.beginPath();
      ctx.arc(sx,    cy*T+8, 14,Math.PI,0);
      ctx.arc(sx+14, cy*T+2, 10,Math.PI,0);
      ctx.arc(sx-12, cy*T+4,  8,Math.PI,0);
      ctx.fill();
    });
    // hills
    [[10,12],[60,11],[120,12],[160,11]].forEach(([hc,hr]) => {
      const sx = hc*T - camX;
      if (sx < -80 || sx > W+80) return;
      ctx.fillStyle='#40b840';
      ctx.beginPath();
      ctx.arc(sx, hr*T, 36, Math.PI, 0); ctx.fill();
      ctx.fillStyle='#50d050';
      ctx.beginPath();
      ctx.arc(sx+18, hr*T-4, 20, Math.PI, 0); ctx.fill();
    });
  }

  function drawTile(c, r, v) {
    const sx=c*T-camX, sy=r*T;
    if (sx<-T||sx>W+T) return;
    if (v===1) {
      ctx.fillStyle = r===12 ? '#e07038' : '#c05820';
      ctx.fillRect(sx,sy,T,T);
      if (r===12) { ctx.fillStyle='#a04020'; ctx.fillRect(sx,sy,T,3); }
      ctx.strokeStyle='rgba(0,0,0,0.12)'; ctx.lineWidth=1;
      ctx.strokeRect(sx,sy,T,T);
    } else if (v===2) {
      ctx.fillStyle='#c07040'; ctx.fillRect(sx,sy,T,T);
      ctx.fillStyle='#904020';
      ctx.fillRect(sx,sy,T,2); ctx.fillRect(sx,sy+T/2-1,T,2);
      const o=(r%2)?4:0;
      for (let x=sx+o;x<sx+T+8;x+=8) {
        ctx.fillRect(x-1,sy+2,2,T/2-3);
        ctx.fillRect(x+3,sy+T/2+1,2,T/2-3);
      }
    } else if (v===3) {
      const b=Math.floor(ticks/6)%4;
      ctx.fillStyle=['#f8c800','#ffd800','#f8c800','#e8b000'][b];
      ctx.fillRect(sx,sy,T,T);
      ctx.fillStyle='#000'; ctx.font='bold 11px monospace'; ctx.textAlign='center';
      ctx.fillText('?',sx+T/2,sy+T-3);
      ctx.strokeStyle='#a08000'; ctx.lineWidth=1; ctx.strokeRect(sx+1,sy+1,T-2,T-2);
    } else if (v===4) {
      ctx.fillStyle='#a08050'; ctx.fillRect(sx,sy,T,T);
      ctx.strokeStyle='#706030'; ctx.lineWidth=1; ctx.strokeRect(sx+1,sy+1,T-2,T-2);
    } else if (v===5) {
      ctx.fillStyle='#008800'; ctx.fillRect(sx,sy,T*2,T);
      ctx.fillStyle='#00aa00'; ctx.fillRect(sx+2,sy,3,T);
      ctx.fillStyle='#004400'; ctx.fillRect(sx+T*2-2,sy,2,T);
    } else if (v===6) {
      ctx.fillStyle='#008800'; ctx.fillRect(sx-2,sy,T*2+4,T);
      ctx.fillStyle='#00aa00'; ctx.fillRect(sx,sy+2,3,T-4);
      ctx.fillStyle='#004400'; ctx.fillRect(sx+T*2,sy+2,2,T-4);
    }
  }

  function drawMap() {
    const sc=Math.max(0,Math.floor(camX/T));
    const ec=Math.min(MAP_W-1, sc+Math.ceil(W/T)+2);
    for (let r=0;r<ROWS;r++) {
      for (let c=sc;c<=ec;c++) {
        const v=map[r][c]; if (!v) continue;
        if ((v===5||v===6) && c>0 && (map[r][c-1]===5||map[r][c-1]===6)) continue;
        drawTile(c,r,v);
      }
    }
  }

  function drawFlag() {
    const fc=(MAP_W-7), sx=fc*T-camX;
    if (sx<-T||sx>W+T) return;
    ctx.fillStyle='#aaa'; ctx.fillRect(sx+T/2-1,2*T,2,10*T);
    ctx.fillStyle='#00cc00'; ctx.fillRect(sx+T/2+1,2*T,T,T);
    ctx.fillStyle='#cc8844';
    ctx.fillRect(sx+T,9*T,T*2,3*T);
    ctx.fillStyle='#cc4400';
    // battlements
    for (let i=0;i<3;i++) ctx.fillRect(sx+T+i*T*2/3,9*T-4,T*2/3-2,6);
  }

  function drawMarioSprite() {
    if (mario.dead) return;
    const sx=mario.x-camX, sy=mario.y;
    ctx.save();
    if (mario.facing===-1) { ctx.translate(sx*2+T,0); ctx.scale(-1,1); }
    const x=mario.facing===1?sx:sx; // already mirrored via ctx
    // Walking animation
    if (mario.onGround && Math.abs(mario.vx)>0.1) {
      mario.ft++; if(mario.ft>6){mario.frame=(mario.frame+1)%3;mario.ft=0;}
    }
    // Hat
    ctx.fillStyle='#cc0000';
    ctx.fillRect(sx+3,sy-3,T-4,3); ctx.fillRect(sx+1,sy,T-2,3);
    // Head
    ctx.fillStyle='#ffaa66'; ctx.fillRect(sx+3,sy+3,T-4,7);
    // Eye
    ctx.fillStyle='#000'; ctx.fillRect(sx+8,sy+4,3,3);
    // Mustache
    ctx.fillStyle='#7a4100'; ctx.fillRect(sx+2,sy+8,T-4,2);
    // Body
    ctx.fillStyle='#cc0000'; ctx.fillRect(sx+2,sy+10,T-4,5);
    ctx.fillStyle='#3050c8'; ctx.fillRect(sx+1,sy+10,3,7); ctx.fillRect(sx+T-4,sy+10,3,7);
    // Arms
    ctx.fillStyle='#ffaa66';
    if (mario.frame===0) { ctx.fillRect(sx-2,sy+10,3,5); ctx.fillRect(sx+T-1,sy+12,3,4); }
    else if (mario.frame===2) { ctx.fillRect(sx-2,sy+12,3,4); ctx.fillRect(sx+T-1,sy+10,3,5); }
    else { ctx.fillRect(sx-1,sy+11,3,4); ctx.fillRect(sx+T-2,sy+11,3,4); }
    // Legs/shoes
    ctx.fillStyle='#5577dd';
    ctx.fillRect(sx+2,sy+17, 4,4); ctx.fillRect(sx+T-6,sy+17,4,4);
    ctx.fillStyle='#5a3000';
    if (mario.onGround) {
      ctx.fillRect(sx,   sy+21, mario.frame===0?6:5, 4);
      ctx.fillRect(sx+T-(mario.frame===2?6:5),sy+21,mario.frame===2?6:5,4);
    } else {
      ctx.fillRect(sx+1,sy+20,6,4); ctx.fillRect(sx+T-7,sy+20,6,4);
    }
    ctx.restore();
  }

  function drawGoombas() {
    goombas.forEach(g => {
      if (!g.alive) return;
      const sx=g.x-camX, sy=g.y;
      if (sx<-T||sx>W+T) return;
      if (g.stomped) {
        ctx.fillStyle='#b84000';
        ctx.fillRect(sx+1,sy+T/2,T-2,T/2+2);
        ctx.fillStyle='#804020'; ctx.fillRect(sx+2,sy+T/2,T-4,3);
        return;
      }
      const wig = Math.floor(ticks/8)%2?0:1;
      ctx.fillStyle='#b84000'; ctx.fillRect(sx+1,sy+4,T-2,T);
      ctx.fillStyle='#804020';
      ctx.fillRect(sx+2,sy,T-4,7);
      ctx.fillRect(sx,sy+T/2,T,5);
      ctx.fillStyle='#604020';
      ctx.fillRect(sx-wig,   sy+T+2,6,4);
      ctx.fillRect(sx+T-6+wig,sy+T+2,6,4);
      ctx.fillStyle='#fff';
      ctx.fillRect(sx+3,sy+2,4,4); ctx.fillRect(sx+T-7,sy+2,4,4);
      ctx.fillStyle='#000';
      ctx.fillRect(sx+4,sy+3,2,2); ctx.fillRect(sx+T-6,sy+3,2,2);
    });
  }

  function drawCoins() {
    floatCoins.forEach(c => {
      if (!c.alive) return;
      const sx=c.x-camX;
      if (sx<-T||sx>W+T) return;
      const s=Math.floor(ticks/5)%2;
      ctx.fillStyle=s?'#ffd700':'#ffee44';
      ctx.beginPath(); ctx.arc(sx,c.y,5,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#c8a000'; ctx.lineWidth=1; ctx.stroke();
    });
  }

  function drawParticles() {
    particles.forEach(p=>{
      p.y+=p.vy; p.vy+=0.28; p.life--;
      if(p.type==='coin') {
        ctx.fillStyle=`rgba(255,215,0,${Math.max(0,p.life/30)})`;
        ctx.beginPath(); ctx.arc(p.x-camX,p.y,4,0,Math.PI*2); ctx.fill();
      }
    });
    particles = particles.filter(p=>p.life>0);
  }

  function overlay(msg, sub, col) {
    ctx.fillStyle='rgba(0,0,0,0.65)'; ctx.fillRect(0,0,W,H);
    ctx.textAlign='center';
    ctx.fillStyle=col; ctx.font='bold 20px monospace'; ctx.fillText(msg,W/2,H/2-10);
    ctx.fillStyle='#fff'; ctx.font='11px monospace'; ctx.fillText(sub,W/2,H/2+10);
    ctx.fillStyle='#aaa'; ctx.font='10px monospace';
    ctx.fillText(t('mario_enter_continue'),W/2,H/2+28);
  }

  /* ── Game Loop ───────────────────────────────────────────────── */
  function loop() {
    if (!document.getElementById('mar-canvas')) {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown',onKey);
      document.removeEventListener('keyup',  onKeyUp);
      return;
    }
    ticks++;

    if (gameState==='playing') {
      moveMario();
      moveGoombas();
      checkCollisions();
      camX = Math.max(0, Math.min(mario.x - W/3, (MAP_W-1)*T - W));
    }

    drawBG(); drawMap(); drawFlag();
    drawCoins(); drawParticles(); drawGoombas(); drawMarioSprite();

    if (gameState==='ready') {
      ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(0,0,W,H);
      ctx.textAlign='center';
      ctx.fillStyle='#FFD700'; ctx.font='bold 22px monospace';
      ctx.fillText('SUPER MARIO BROS',W/2,H/2-14);
      ctx.fillStyle='#fff'; ctx.font='11px monospace';
      ctx.fillText(t('mario_ready_hint'),W/2,H/2+8);
      ctx.fillStyle='#aaa'; ctx.font='9px monospace';
      ctx.fillText(t('mario_ready_controls'),W/2,H/2+24);
    }
    if (gameState==='dead')     overlay(t('mario_dead'),     t('mario_score')+score,'#FF3333');
    if (gameState==='gameover') overlay(t('mario_gameover'), t('mario_score')+score,'#FF0000');
    if (gameState==='win')      overlay(t('mario_win'),      t('mario_score')+score,'#00FF44');

    raf = requestAnimationFrame(loop);
  }

  gameState='ready'; ticks=0;
  fullReset();
  loop();
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAC-MAN
══════════════════════════════════════════════════════════════════════════════ */
function bPacman() {
  return `
    <div id="pac-wrap" style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:8px 4px">
      <div style="display:flex;gap:18px;font-size:11px;font-family:monospace;width:100%;justify-content:center">
        <span>SCORE: <strong id="pac-score">0</strong></span>
        <span id="pac-lives-el">❤❤❤</span>
        <span>LVL: <strong id="pac-level">1</strong></span>
      </div>
      <canvas id="pac-canvas" style="border:2px solid #000;background:#000;display:block;image-rendering:pixelated"></canvas>
      <div id="pac-msg" style="font-size:10px;color:#555;text-align:center;line-height:1.5">
        ${t('pac_hint')}
      </div>
    </div>`;
}

function initPacman() {
  const canvas = document.getElementById('pac-canvas');
  if (!canvas) return;

  const C = 17; // cell px
  const COLS = 21, ROWS = 21;
  canvas.width  = COLS * C;
  canvas.height = ROWS * C;
  const ctx = canvas.getContext('2d');

  // 0=dot 1=wall 2=power 3=empty 4=ghostdoor
  const MAP_TPL = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,2,1],
    [1,0,1,1,0,1,1,1,0,0,1,0,0,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,0,1,0,1,0,1,0,1,1,0,1,1,0,1],
    [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
    [1,1,1,0,0,1,0,1,1,1,4,1,1,1,0,1,0,0,1,1,1],
    [3,3,3,0,0,0,0,0,3,3,3,3,3,0,0,0,0,0,3,3,3],
    [1,1,1,0,0,1,0,1,3,3,3,3,3,1,0,1,0,0,1,1,1],
    [1,0,0,0,0,1,0,1,3,3,3,3,3,1,0,1,0,0,0,0,1],
    [1,0,1,1,0,0,0,1,3,3,3,3,3,1,0,0,0,1,1,0,1],
    [1,0,0,0,0,1,0,1,1,1,1,1,1,1,0,1,0,0,0,0,1],
    [1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,1,1,1],
    [1,0,0,0,0,0,0,1,1,0,1,0,1,1,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,0,0,0,1,0,0,0,0,1,0,1,1,0,1],
    [1,2,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,2,1],
    [1,1,0,1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,0,1,1],
    [1,0,0,0,0,1,0,0,0,0,3,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ];

  let map, score, lives, level, dotsTotal, dotsEaten;
  let pac, ghosts, scaredTimer, ghostBlink;
  let state; // 'ready' | 'playing' | 'dead' | 'win' | 'gameover'
  let raf;
  let ghostMoveEvery = 8; // ticks between ghost steps
  let pacMoveEvery   = 5;
  let ticks = 0;

  function deepCopy(m) { return m.map(r => r.slice()); }

  function initLevel() {
    map = deepCopy(MAP_TPL);
    dotsTotal = 0; dotsEaten = 0;
    map.forEach(r => r.forEach(c => { if (c === 0 || c === 2) dotsTotal++; }));

    pac = { x:10, y:17, dx:0, dy:0, ndx:0, ndy:0, mouth:0, mdir:1, timer:0 };
    ghosts = [
      { x:9,  y:9,  dx:1,  dy:0,  color:'#FF0000', scared:false, eaten:false },
      { x:11, y:9,  dx:-1, dy:0,  color:'#FFB8FF', scared:false, eaten:false },
      { x:10, y:10, dx:0,  dy:1,  color:'#00FFFF', scared:false, eaten:false },
      { x:9,  y:10, dx:0,  dy:-1, color:'#FFB852', scared:false, eaten:false },
    ];
    scaredTimer = 0;
    ghostBlink  = false;
    state = 'ready';
    updateHUD();
  }

  function updateHUD() {
    const s = document.getElementById('pac-score');
    const l = document.getElementById('pac-lives-el');
    const v = document.getElementById('pac-level');
    if (s) s.textContent = score;
    if (l) l.textContent = '❤'.repeat(Math.max(0, lives));
    if (v) v.textContent = level;
  }

  function canEnter(x, y, isGhost) {
    const wx = ((x % COLS) + COLS) % COLS;
    if (y < 0 || y >= ROWS) return false;
    const c = map[y][wx];
    if (c === 1) return false;
    if (c === 4 && !isGhost) return false; // only ghosts pass the door
    return true;
  }

  function wrap(x) { return ((x % COLS) + COLS) % COLS; }

  function movePac() {
    pac.timer++;
    if (pac.timer < pacMoveEvery) return;
    pac.timer = 0;

    // try queued direction first
    const tx = wrap(pac.x + pac.ndx), ty = pac.y + pac.ndy;
    if ((pac.ndx !== 0 || pac.ndy !== 0) && canEnter(tx, ty, false)) {
      pac.dx = pac.ndx; pac.dy = pac.ndy;
    }
    const nx = wrap(pac.x + pac.dx), ny = pac.y + pac.dy;
    if (canEnter(nx, ny, false)) { pac.x = nx; pac.y = ny; }

    const cell = map[pac.y][pac.x];
    if (cell === 0) { map[pac.y][pac.x] = 3; score += 10; dotsEaten++; updateHUD(); }
    if (cell === 2) {
      map[pac.y][pac.x] = 3; score += 50; dotsEaten++;
      scaredTimer = 7 * 60; // 7 s @60fps
      ghosts.forEach(g => { g.scared = true; g.eaten = false; });
      updateHUD();
    }
  }

  function moveGhosts() {
    if (scaredTimer > 0) {
      scaredTimer--;
      ghostBlink = scaredTimer < 2 * 60 && Math.floor(scaredTimer / 15) % 2 === 0;
      if (scaredTimer === 0) ghosts.forEach(g => { g.scared = false; g.eaten = false; });
    }

    ghosts.forEach(g => {
      const dirs = [
        { dx:1,dy:0 }, { dx:-1,dy:0 }, { dx:0,dy:1 }, { dx:0,dy:-1 }
      ].filter(d => {
        if (d.dx === -g.dx && d.dy === -g.dy) return false; // no U-turn
        return canEnter(g.x + d.dx, g.y + d.dy, true);
      });

      if (!dirs.length) { g.dx = -g.dx; g.dy = -g.dy; return; }

      let chosen;
      if (g.scared) {
        chosen = dirs[Math.floor(Math.random() * dirs.length)];
      } else {
        chosen = dirs.reduce((best, d) => {
          const nx = wrap(g.x + d.dx), ny = g.y + d.dy;
          const bd = wrap(g.x + best.dx), by = g.y + best.dy;
          const da = Math.abs(nx - pac.x) + Math.abs(ny - pac.y);
          const db = Math.abs(bd - pac.x) + Math.abs(by - pac.y);
          return da < db ? d : best;
        });
      }
      g.dx = chosen.dx; g.dy = chosen.dy;
      g.x = wrap(g.x + g.dx);
      g.y = Math.max(0, Math.min(ROWS - 1, g.y + g.dy));
    });
  }

  function checkHits() {
    ghosts.forEach(g => {
      if (g.x !== pac.x || g.y !== pac.y) return;
      if (g.scared && !g.eaten) {
        g.eaten = true; g.scared = false;
        g.x = 10; g.y = 9; // back to house
        score += 200; updateHUD();
      } else if (!g.scared && !g.eaten) {
        state = 'dead';
      }
    });
  }

  /* ─── Drawing ───────────────────────────────────────────────────── */
  function drawMaze() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const v = map[r][c];
        const px = c * C, py = r * C;
        if (v === 1) {
          ctx.fillStyle = '#00008B';
          ctx.fillRect(px, py, C, C);
          ctx.strokeStyle = '#1111CC';
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 1, py + 1, C - 2, C - 2);
        } else if (v === 0) {
          ctx.fillStyle = '#FFD700';
          ctx.beginPath();
          ctx.arc(px + C/2, py + C/2, 2, 0, Math.PI*2);
          ctx.fill();
        } else if (v === 2) {
          const t = Date.now();
          ctx.fillStyle = Math.floor(t / 300) % 2 ? '#FFD700' : '#FFAA00';
          ctx.beginPath();
          ctx.arc(px + C/2, py + C/2, 5, 0, Math.PI*2);
          ctx.fill();
        } else if (v === 4) {
          ctx.fillStyle = '#FF8888';
          ctx.fillRect(px, py + C/2 - 1, C, 2);
        }
      }
    }
  }

  function drawPac() {
    pac.mouth += 0.18 * pac.mdir;
    if (pac.mouth > 0.35) pac.mdir = -1;
    if (pac.mouth < 0.02) pac.mdir =  1;

    const angle = Math.atan2(pac.dy, pac.dx);
    const px = pac.x * C + C/2, py = pac.y * C + C/2;
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.arc(px, py, C/2 - 1, angle + pac.mouth, angle + Math.PI*2 - pac.mouth);
    ctx.closePath();
    ctx.fill();
  }

  function drawGhosts() {
    ghosts.forEach(g => {
      const gx = g.x * C + C/2, gy = g.y * C + C/2;
      const r  = C/2 - 1;
      let col;
      if (g.eaten)       col = 'transparent';
      else if (g.scared) col = ghostBlink ? '#fff' : '#0033FF';
      else               col = g.color;

      if (g.eaten) {
        // just eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(gx - 3, gy - 2, 3, 3.5, 0, 0, Math.PI*2);
        ctx.ellipse(gx + 3, gy - 2, 3, 3.5, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#00f';
        ctx.beginPath();
        ctx.arc(gx - 3, gy - 2, 1.5, 0, Math.PI*2);
        ctx.arc(gx + 3, gy - 2, 1.5, 0, Math.PI*2);
        ctx.fill();
        return;
      }

      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(gx, gy - 1, r, Math.PI, 0);
      const w3 = (r * 2) / 3;
      ctx.lineTo(gx + r, gy + r);
      ctx.lineTo(gx + r - w3,     gy + r - 3);
      ctx.lineTo(gx,               gy + r);
      ctx.lineTo(gx - r + w3,     gy + r - 3);
      ctx.lineTo(gx - r, gy + r);
      ctx.closePath();
      ctx.fill();

      if (!g.scared) {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(gx - 3, gy - 2, 3, 3.5, 0, 0, Math.PI*2);
        ctx.ellipse(gx + 3, gy - 2, 3, 3.5, 0, 0, Math.PI*2);
        ctx.fill();
        const ex = g.dx * 1.2, ey = g.dy * 1.2;
        ctx.fillStyle = '#00f';
        ctx.beginPath();
        ctx.arc(gx - 3 + ex, gy - 2 + ey, 1.5, 0, Math.PI*2);
        ctx.arc(gx + 3 + ex, gy - 2 + ey, 1.5, 0, Math.PI*2);
        ctx.fill();
      }
    });
  }

  function drawOverlay(msg, sub, color) {
    ctx.fillStyle = 'rgba(0,0,0,0.72)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.fillStyle = color;
    ctx.font = 'bold 22px monospace';
    ctx.fillText(msg, canvas.width/2, canvas.height/2 - 10);
    ctx.fillStyle = '#FFD700';
    ctx.font = '11px monospace';
    ctx.fillText(sub, canvas.width/2, canvas.height/2 + 14);
    ctx.fillStyle = '#aaa';
    ctx.font = '10px monospace';
    ctx.fillText(t('pac_enter_again'), canvas.width/2, canvas.height/2 + 32);
  }

  function drawReady() {
    ctx.fillStyle = 'rgba(0,0,0,0.60)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 20px monospace';
    ctx.fillText('PAC-MAN', canvas.width/2, canvas.height/2 - 12);
    ctx.fillStyle = '#aaa';
    ctx.font = '11px monospace';
    ctx.fillText(t('pac_ready_hint'), canvas.width/2, canvas.height/2 + 10);
  }

  /* ─── Game Loop ─────────────────────────────────────────────────── */
  function loop() {
    if (!document.getElementById('pac-canvas')) { cancelAnimationFrame(raf); return; }

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawMaze();

    ticks++;

    if (state === 'playing') {
      movePac();
      if (ticks % ghostMoveEvery === 0) moveGhosts();
      checkHits();
      if (dotsEaten >= dotsTotal) { state = 'win'; level++; }
    }

    drawGhosts();
    drawPac();

    if (state === 'ready')    drawReady();
    if (state === 'dead')     drawOverlay(t('pac_dead'),     t('pac_score') + score, '#FF3333');
    if (state === 'gameover') drawOverlay(t('pac_gameover'), t('pac_score') + score, '#FF0000');
    if (state === 'win')      drawOverlay(t('pac_win'),      t('pac_score') + score, '#00FF00');

    raf = requestAnimationFrame(loop);
  }

  /* ─── Input ─────────────────────────────────────────────────────── */
  function onKey(e) {
    if (!document.getElementById('pac-canvas')) {
      document.removeEventListener('keydown', onKey); return;
    }
    const dirs = {
      ArrowLeft:  [-1,0], ArrowRight: [1,0],
      ArrowUp:    [0,-1], ArrowDown:  [0,1],
    };
    if (dirs[e.key]) {
      e.preventDefault();
      if (state === 'playing') {
        [pac.ndx, pac.ndy] = dirs[e.key];
      }
    }
    if (e.key === 'Enter') {
      if (state === 'ready') { state = 'playing'; return; }
      if (state === 'dead') {
        lives--;
        if (lives <= 0) { state = 'gameover'; return; }
        pac.x=10; pac.y=17; pac.dx=0; pac.dy=0; pac.ndx=0; pac.ndy=0;
        ghosts.forEach((g,i) => {
          const sp = [[9,9],[11,9],[10,10],[9,10]][i];
          g.x=sp[0]; g.y=sp[1]; g.scared=false; g.eaten=false;
        });
        scaredTimer=0; state='playing'; return;
      }
      if (state === 'gameover' || state === 'win') {
        score=0; lives=3; level= state==='win' ? level : 1;
        ghostMoveEvery = Math.max(3, 8 - (level - 1));
        initLevel(); state='playing';
      }
    }
  }
  document.addEventListener('keydown', onKey);

  score = 0; lives = 3; level = 1;
  initLevel();
  loop();
}

/* ═══════════════════════════════════════════════════════════════════════════
   BOOT SEQUENCE
══════════════════════════════════════════════════════════════════════════════ */
const BOOT_STEPS = [
  [0,   t('boot_0')],
  [18,  t('boot_1')],
  [38,  t('boot_2')],
  [58,  t('boot_3')],
  [78,  t('boot_4')],
  [92,  t('boot_5')],
  [100, t('boot_6')],
];

async function boot() {
  const bar = document.getElementById('boot-bar');
  const msg = document.getElementById('boot-msg');

  for (const [pct, txt] of BOOT_STEPS) {
    bar.style.width = pct + '%';
    msg.textContent = txt;
    await new Promise(r => setTimeout(r, pct === 0 ? 200 : 300));
  }

  await new Promise(r => setTimeout(r, 400));

  const b = document.getElementById('boot');
  b.style.transition = 'opacity .5s';
  b.style.opacity    = '0';
  await new Promise(r => setTimeout(r, 520));
  b.style.display = 'none';

  /* Janelas que abrem automaticamente ao arrancar */
  setTimeout(() => openWin('finder'), 100);
  setTimeout(() => openWin('about'),  380);
}

boot();
