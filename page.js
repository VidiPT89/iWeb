'use strict';

/* ─── Estado ─────────────────────────────────────────────────────────────── */
let dragging = null, resizing = null;
let zoomed   = false, savedStyle = {};

/* ─── Janela única ───────────────────────────────────────────────────────── */
document.addEventListener('mousedown', e => {
  const win = document.getElementById('main-win');

  if (e.target.dataset.act === 'close') { window.location.href = 'index.html'; return; }
  if (e.target.dataset.act === 'zoom')  { toggleZoom(win); return; }

  if (e.target.closest('.wresize')) {
    resizing = { win, ox:e.clientX, oy:e.clientY, w0:win.offsetWidth, h0:win.offsetHeight };
    e.preventDefault(); return;
  }
  if (e.target.closest('.wtb') && !e.target.dataset.act) {
    dragging = { win, ox: e.clientX - win.offsetLeft, oy: e.clientY - win.offsetTop };
    e.preventDefault();
  }
});

document.addEventListener('mousemove', e => {
  if (dragging) {
    dragging.win.style.left = Math.max(0, e.clientX - dragging.ox) + 'px';
    dragging.win.style.top  = Math.max(0, e.clientY - dragging.oy) + 'px';
  }
  if (resizing) {
    resizing.win.style.width  = Math.max(300, resizing.w0 + e.clientX - resizing.ox) + 'px';
    resizing.win.style.height = Math.max(200, resizing.h0 + e.clientY - resizing.oy) + 'px';
  }
});

document.addEventListener('mouseup', () => { dragging = null; resizing = null; });

function toggleZoom(win) {
  const desk = document.getElementById('desktop');
  if (zoomed) {
    win.style.width  = savedStyle.w; win.style.height = savedStyle.h;
    win.style.left   = savedStyle.l; win.style.top    = savedStyle.t;
    zoomed = false;
  } else {
    savedStyle = { w:win.style.width, h:win.style.height, l:win.style.left, t:win.style.top };
    win.style.width  = (desk.clientWidth  - 100) + 'px';
    win.style.height = (desk.clientHeight -  30) + 'px';
    win.style.left = '8px'; win.style.top = '8px';
    zoomed = true;
  }
}

/* ─── Menu bar ───────────────────────────────────────────────────────────── */
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

document.addEventListener('click', closeMenus);

document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
    e.preventDefault();
    window.location.href = 'index.html';
  }
});

/* ─── Relógio ────────────────────────────────────────────────────────────── */
function tick() {
  const n = new Date(), el = document.getElementById('mb-clock');
  if (el) el.textContent =
    String(n.getHours()).padStart(2,'0') + ':' + String(n.getMinutes()).padStart(2,'0');
}
tick(); setInterval(tick, 15000);

/* ─── Diálogos ───────────────────────────────────────────────────────────── */
function openDlg(key) {
  const ico = document.getElementById('dlg-ico');
  const msg = document.getElementById('dlg-msg');
  const row = document.getElementById('dlg-row');
  document.getElementById('overlay').classList.add('show');

  if (key === 'about-sys') {
    ico.textContent = '🖥';
    msg.innerHTML = t('dlg_about_sys_msg');
    row.innerHTML = `<button class="macbtn primary" onclick="closeDlg()">${t('dlg_ok')}</button>`;
  } else if (key === 'restart') {
    ico.textContent = '💾';
    msg.innerHTML = t('dlg_restart_msg');
    row.innerHTML = `
      <button class="macbtn" onclick="closeDlg()">${t('dlg_cancel')}</button>
      <button class="macbtn primary" onclick="closeDlg();location.reload()">${t('dlg_restart_btn')}</button>`;
  }
}
function closeDlg() { document.getElementById('overlay').classList.remove('show'); }
