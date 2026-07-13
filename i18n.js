'use strict';

/* ═══════════════════════════════════════════════════════════════════════════
   I18N — PT-PT / EN toggle, shared by every page (index, about, projects,
   skills, contact). Preference is stored in localStorage and survives reloads.
══════════════════════════════════════════════════════════════════════════════ */
const LANG_KEY = 'iweb-lang';

const I18N = {
  pt: {
    menu_file: 'Ficheiro',
    menu_edit: 'Editar',
    menu_view: 'Ver',
    menu_special: 'Especial',

    dd_apple_about_sys: 'Sobre este Portfolio…',
    dd_apple_control_panel: 'Painel de Controlo',
    dd_apple_restart: 'Reiniciar…',

    dd_file_back_desktop: '← Voltar ao Desktop',
    dd_file_open_portfolio: 'Abrir Portfolio HD',
    dd_file_close_window: 'Fechar Janela',
    dd_file_close_window_full: 'Fechar Janela &nbsp;⌘W',

    dd_edit_undo: 'Desfazer',
    dd_edit_cut: 'Cortar',
    dd_edit_copy: 'Copiar',
    dd_edit_paste: 'Colar',
    dd_edit_undo_full: 'Desfazer &nbsp;⌘Z',
    dd_edit_cut_full: 'Cortar &nbsp;⌘X',
    dd_edit_copy_full: 'Copiar &nbsp;⌘C',
    dd_edit_paste_full: 'Colar &nbsp;⌘V',

    dd_view_by_icon: 'Por Ícone',
    dd_view_by_name: 'Por Nome',
    dd_view_by_date: 'Por Data',
    dd_view_arrange: 'Organizar',

    dd_special_open_terminal: 'Abrir Terminal',
    dd_special_play_pacman: '🕹 Jogar Pac-Man',
    dd_special_play_mario: '🍄 Jogar Mario Bros',
    dd_special_empty_trash: 'Esvaziar Lixo',

    ctx_open_portfolio: 'Abrir Portfolio HD',
    ctx_new_folder: 'Nova Pasta',
    ctx_get_info: 'Obter Informações',
    ctx_arrange: 'Organizar',

    win_finder: 'Portfolio HD',
    win_about: 'Sobre Mim',
    win_projects: 'Projetos',
    win_skills: 'Competências',
    win_contact: 'Contacto',
    win_terminal: 'Terminal',
    win_trash: 'Lixo',
    win_pacman: 'Pac-Man',
    win_mario: 'Mario Bros',

    finder_status: '6 itens',
    trash_status: 'Lixo vazio',
    trash_empty_msg: 'O Lixo está vazio.',
    pacman_status: 'Usa ← → ↑ ↓',
    mario_status: '← → ↑ Z Espaço',

    boot_title: 'Portfolio iVidi.dev',
    boot_0: 'A iniciar o sistema…',
    boot_1: 'A carregar extensões…',
    boot_2: 'A verificar disco de portfólio…',
    boot_3: 'A inicializar o Finder…',
    boot_4: 'A carregar dados…',
    boot_5: 'Quase pronto…',
    boot_6: 'Bem-vindo!',

    dlg_about_sys_msg:
      '<strong>Portfolio System 7</strong><br>Primeiro portfolio de David Arsénio Martins — 2024<br><br>' +
      'Portfolio atual → <a href="https://ividi.dev/" target="_blank" style="color:#3377CC">ividi.dev ↗</a><br><br>' +
      'Feito com HTML, CSS &amp; JavaScript.<br>Inspirado no Mac OS System 7.',
    dlg_restart_msg: 'Tem a certeza que quer reiniciar?<br>Todas as janelas abertas serão fechadas.',
    dlg_ok: 'OK',
    dlg_cancel: 'Cancelar',
    dlg_restart_btn: 'Reiniciar',

    finder_toolbar_title: 'Portfolio HD',
    finder_toolbar_count: '6 itens',

    about_role: 'Software Developer',
    about_tagline: 'mas todos me chamam Vidi',
    badge_location: '📍 Cascais, Portugal',
    badge_photo: '📸 Ex-Fotógrafo Profissional',
    badge_open: '💼 Aberto a oportunidades',

    stitle_bio: 'Bio',
    about_bio_1:
      'Sou o David Arsénio Martins — conhecido como Vidi desde criança. Fotógrafo profissional em ' +
      'transição para o Desenvolvimento de Software. Com experiência prévia em IT e capacidades de ' +
      'resolução de problemas, criatividade e atenção ao detalhe, estou a expandir o meu conhecimento ' +
      'técnico e à procura de oportunidades para colaborar e contribuir em projetos de software.',
    about_bio_2:
      'Antes disso, completei o Curso Técnico de Gestão de Equipamentos Informáticos (Nível 4 — ' +
      'equivalente ao 10º–12º ano) na Escola Profissional de Tecnologia Digital, onde dei os meus ' +
      'primeiros passos em IT. Atualmente frequento o curso de Software Developer na CESAE Digital, ' +
      'integrado no laboratório digital Reskilling 4 Employment, que abrange desenvolvimento web e ' +
      'mobile, gestão de bases de dados e engenharia de software.',
    about_bio_3:
      'Fora do código continuo a ser fotógrafo de coração, entusiasta de xadrez e sudoku, e alguém ' +
      'que acredita que aprender todos os dias é o que faz a diferença.',

    stitle_journey: 'Percurso',
    j1_role: 'Técnico de Gestão de Equipamentos Informáticos',
    j1_where: 'Escola Profissional de Tecnologia Digital · Nível 4',
    j1_desc: 'Primeiros passos em IT — curso equivalente ao 10º–12º ano.',
    j2_role: 'Fotógrafo Profissional',
    j2_where: 'Freelancer',
    j2_desc: 'Anos de trabalho como fotógrafo — criatividade, atenção ao detalhe e resolução de problemas aplicadas a cada projeto.',
    j3_role: 'Software Developer',
    j3_where: 'CESAE Digital · Reskilling 4 Employment',
    j3_desc: 'A frequentar o curso de Software Developer — desenvolvimento web e mobile, bases de dados e engenharia de software.',

    stitle_education: 'Educação',
    edu1_role: 'Técnico de Gestão de Equipamentos Informáticos (Nível 4)',
    edu1_where: 'Escola Profissional de Tecnologia Digital',
    edu2_role: 'Curso de Software Developer',
    edu2_where: 'CESAE Digital · Reskilling 4 Employment',

    stitle_tech_skills: 'Competências Técnicas',
    see_full_skills: '→ Ver Competências completas',

    stitle_current_portfolio: 'Portfolio Atual',
    current_portfolio_note:
      '🕰 Este foi o meu primeiro site portfolio, por isso já não está atualizado. ' +
      'O meu site atual está em',

    btn_download_cv: '⬇ Download CV (PDF)',
    btn_contact: '✉ Contactar',

    about_wbar: 'David Arsénio Martins — Software Developer · Cascais, Portugal',

    stitle_software_dev: 'Programação',
    stitle_database: 'Bases de Dados',
    stitle_mobile: 'Mobile',
    stitle_tools_practices: 'Ferramentas & Práticas',
    stitle_office: 'Office',
    stitle_photography: 'Fotografia',
    skills_wbar_prefix: 'Competências em',
    skills_wbar_categories: '6 categorias',

    ct_intro: 'Tenho sempre interesse em novos projetos, ideias e oportunidades. Entra em contacto por qualquer um dos canais abaixo!',
    stitle_direct_contact: 'Contactos Diretos',
    ct_lbl_email: 'Email',
    ct_lbl_github: 'GitHub',
    ct_lbl_linkedin: 'LinkedIn',
    ct_lbl_portfolio: 'Portfolio Atual',
    ct_note:
      '📍 Cascais, Portugal &nbsp;·&nbsp; 🌍 Disponível para trabalho remoto<br>' +
      '🕐 GMT+0 (WET/WEST) &nbsp;·&nbsp; ✅ Aberto a oportunidades',
    stitle_send_message: 'Enviar Mensagem',
    ct_lbl_name: 'Nome',
    ct_placeholder_name: 'O teu nome',
    ct_placeholder_email: 'o.teu@email.com',
    ct_lbl_message: 'Mensagem',
    ct_placeholder_message: 'A tua mensagem…',
    ct_send_btn: 'Enviar ✉',
    ct_send_alert: '← Este formulário é só uma demonstração. Escreve-me diretamente para ividi.dev@gmail.com!',
    ct_wbar: 'ividi.dev@gmail.com',

    proj_loading: 'A carregar projetos do GitHub…',
    proj_error_prefix: '⚠ Erro ao carregar GitHub: ',
    proj_error_static: '⚠ Não foi possível carregar do GitHub. Verifica a ligação à internet.',
    proj_no_desc: 'Sem descrição.',
    proj_no_desc_alt: 'Sem descrição — consulta o repositório no GitHub.',
    proj_mine_section: 'Os meus projetos',
    proj_forks_section: 'Forks / Contribuições',
    proj_run_btn: '▶ Executar',
    proj_status_loading: 'A carregar…',
    proj_status_error: 'Erro ao carregar GitHub',
    proj_count_projects: 'projetos',
    proj_count_forks: 'forks',

    pac_hint: '← → ↑ ↓ para mover &nbsp;·&nbsp; ENTER para iniciar / reiniciar',
    pac_ready_hint: 'Pressiona ENTER para começar',
    pac_dead: 'MORREU!',
    pac_gameover: 'GAME OVER',
    pac_win: 'PARABÉNS! 🎉',
    pac_score: 'Score: ',
    pac_enter_again: 'ENTER para jogar de novo',

    mario_hint: '← → mover &nbsp;·&nbsp; Z/Espaço/↑ saltar &nbsp;·&nbsp; ENTER iniciar',
    mario_ready_hint: 'ENTER para começar',
    mario_ready_controls: '← → mover  ·  Z/Espaço/↑ saltar  ·  Shift correr',
    mario_dead: 'MORREU!',
    mario_gameover: 'GAME OVER',
    mario_win: '🎉 PARABÉNS!',
    mario_score: 'Score: ',
    mario_enter_continue: 'ENTER para continuar',
  },

  en: {
    menu_file: 'File',
    menu_edit: 'Edit',
    menu_view: 'View',
    menu_special: 'Special',

    dd_apple_about_sys: 'About This Portfolio…',
    dd_apple_control_panel: 'Control Panel',
    dd_apple_restart: 'Restart…',

    dd_file_back_desktop: '← Back to Desktop',
    dd_file_open_portfolio: 'Open Portfolio HD',
    dd_file_close_window: 'Close Window',
    dd_file_close_window_full: 'Close Window &nbsp;⌘W',

    dd_edit_undo: 'Undo',
    dd_edit_cut: 'Cut',
    dd_edit_copy: 'Copy',
    dd_edit_paste: 'Paste',
    dd_edit_undo_full: 'Undo &nbsp;⌘Z',
    dd_edit_cut_full: 'Cut &nbsp;⌘X',
    dd_edit_copy_full: 'Copy &nbsp;⌘C',
    dd_edit_paste_full: 'Paste &nbsp;⌘V',

    dd_view_by_icon: 'By Icon',
    dd_view_by_name: 'By Name',
    dd_view_by_date: 'By Date',
    dd_view_arrange: 'Arrange',

    dd_special_open_terminal: 'Open Terminal',
    dd_special_play_pacman: '🕹 Play Pac-Man',
    dd_special_play_mario: '🍄 Play Mario Bros',
    dd_special_empty_trash: 'Empty Trash',

    ctx_open_portfolio: 'Open Portfolio HD',
    ctx_new_folder: 'New Folder',
    ctx_get_info: 'Get Info',
    ctx_arrange: 'Arrange',

    win_finder: 'Portfolio HD',
    win_about: 'About Me',
    win_projects: 'Projects',
    win_skills: 'Skills',
    win_contact: 'Contact',
    win_terminal: 'Terminal',
    win_trash: 'Trash',
    win_pacman: 'Pac-Man',
    win_mario: 'Mario Bros',

    finder_status: '6 items',
    trash_status: 'Trash Empty',
    trash_empty_msg: 'The Trash is empty.',
    pacman_status: 'Use ← → ↑ ↓',
    mario_status: '← → ↑ Z Space',

    boot_title: 'Portfolio iVidi.dev',
    boot_0: 'Starting up the system…',
    boot_1: 'Loading extensions…',
    boot_2: 'Checking portfolio disk…',
    boot_3: 'Initializing Finder…',
    boot_4: 'Loading data…',
    boot_5: 'Almost ready…',
    boot_6: 'Welcome!',

    dlg_about_sys_msg:
      '<strong>Portfolio System 7</strong><br>David Arsénio Martins\'s first portfolio — 2024<br><br>' +
      'Current portfolio → <a href="https://ividi.dev/" target="_blank" style="color:#3377CC">ividi.dev ↗</a><br><br>' +
      'Made with HTML, CSS &amp; JavaScript.<br>Inspired by Mac OS System 7.',
    dlg_restart_msg: 'Are you sure you want to restart?<br>All open windows will be closed.',
    dlg_ok: 'OK',
    dlg_cancel: 'Cancel',
    dlg_restart_btn: 'Restart',

    finder_toolbar_title: 'Portfolio HD',
    finder_toolbar_count: '6 items',

    about_role: 'Software Developer',
    about_tagline: 'but everyone calls me Vidi',
    badge_location: '📍 Cascais, Portugal',
    badge_photo: '📸 Former Professional Photographer',
    badge_open: '💼 Open to opportunities',

    stitle_bio: 'Bio',
    about_bio_1:
      'I\'m David Arsénio Martins — known as Vidi since childhood. A professional photographer ' +
      'transitioning to Software Development. With previous IT experience and skills in ' +
      'problem-solving, creativity and attention to detail, I\'m expanding my technical knowledge ' +
      'and seeking opportunities to collaborate and contribute to software projects.',
    about_bio_2:
      'Before that, I completed the IT Equipment Management Technician course (Level 4 — equivalent ' +
      'to 10th–12th grade) at Escola Profissional de Tecnologia Digital, where I took my first steps ' +
      'in IT. I\'m currently attending the Software Developer course at CESAE Digital, integrated in ' +
      'the Reskilling 4 Employment digital lab, covering web and mobile development, database ' +
      'management and software engineering.',
    about_bio_3:
      'Outside of code I\'m still a photographer at heart, a chess and sudoku enthusiast, and someone ' +
      'who believes that learning every day is what makes the difference.',

    stitle_journey: 'Journey',
    j1_role: 'IT Equipment Management Technician',
    j1_where: 'Escola Profissional de Tecnologia Digital · Level 4',
    j1_desc: 'First steps in IT — course equivalent to 10th–12th grade.',
    j2_role: 'Professional Photographer',
    j2_where: 'Freelance',
    j2_desc: 'Years of work as a photographer — creativity, attention to detail and problem-solving applied to every project.',
    j3_role: 'Software Developer',
    j3_where: 'CESAE Digital · Reskilling 4 Employment',
    j3_desc: 'Currently attending the Software Developer course — web and mobile development, databases and software engineering.',

    stitle_education: 'Education',
    edu1_role: 'IT Equipment Management Technician (Level 4)',
    edu1_where: 'Escola Profissional de Tecnologia Digital',
    edu2_role: 'Software Developer Course',
    edu2_where: 'CESAE Digital · Reskilling 4 Employment',

    stitle_tech_skills: 'Technical Skills',
    see_full_skills: '→ See full Skills',

    stitle_current_portfolio: 'Current Portfolio',
    current_portfolio_note:
      '🕰 This was my first portfolio site, so it\'s no longer up to date. ' +
      'My current site is at',

    btn_download_cv: '⬇ Download CV (PDF)',
    btn_contact: '✉ Contact',

    about_wbar: 'David Arsénio Martins — Software Developer · Cascais, Portugal',

    stitle_software_dev: 'Software Dev',
    stitle_database: 'Database',
    stitle_mobile: 'Mobile',
    stitle_tools_practices: 'Tools & Practices',
    stitle_office: 'Office',
    stitle_photography: 'Photography',
    skills_wbar_prefix: 'Skills across',
    skills_wbar_categories: '6 categories',

    ct_intro: 'I\'m always interested in new projects, ideas and opportunities. Reach out through any of the channels below!',
    stitle_direct_contact: 'Direct Contacts',
    ct_lbl_email: 'Email',
    ct_lbl_github: 'GitHub',
    ct_lbl_linkedin: 'LinkedIn',
    ct_lbl_portfolio: 'Current Portfolio',
    ct_note:
      '📍 Cascais, Portugal &nbsp;·&nbsp; 🌍 Available for remote work<br>' +
      '🕐 GMT+0 (WET/WEST) &nbsp;·&nbsp; ✅ Open to opportunities',
    stitle_send_message: 'Send a Message',
    ct_lbl_name: 'Name',
    ct_placeholder_name: 'Your name',
    ct_placeholder_email: 'your@email.com',
    ct_lbl_message: 'Message',
    ct_placeholder_message: 'Your message…',
    ct_send_btn: 'Send ✉',
    ct_send_alert: '← This form is just a demo. Email me directly at ividi.dev@gmail.com!',
    ct_wbar: 'ividi.dev@gmail.com',

    proj_loading: 'Loading projects from GitHub…',
    proj_error_prefix: '⚠ Error loading GitHub: ',
    proj_error_static: '⚠ Couldn\'t load from GitHub. Check your internet connection.',
    proj_no_desc: 'No description.',
    proj_no_desc_alt: 'No description — check the repository on GitHub.',
    proj_mine_section: 'My Projects',
    proj_forks_section: 'Forks / Contributions',
    proj_run_btn: '▶ Run',
    proj_status_loading: 'Loading…',
    proj_status_error: 'Error loading GitHub',
    proj_count_projects: 'projects',
    proj_count_forks: 'forks',

    pac_hint: '← → ↑ ↓ to move &nbsp;·&nbsp; ENTER to start / restart',
    pac_ready_hint: 'Press ENTER to start',
    pac_dead: 'YOU DIED!',
    pac_gameover: 'GAME OVER',
    pac_win: 'YOU WIN! 🎉',
    pac_score: 'Score: ',
    pac_enter_again: 'ENTER to play again',

    mario_hint: '← → move &nbsp;·&nbsp; Z/Space/↑ jump &nbsp;·&nbsp; ENTER start',
    mario_ready_hint: 'ENTER to start',
    mario_ready_controls: '← → move  ·  Z/Space/↑ jump  ·  Shift run',
    mario_dead: 'YOU DIED!',
    mario_gameover: 'GAME OVER',
    mario_win: '🎉 YOU WIN!',
    mario_score: 'Score: ',
    mario_enter_continue: 'ENTER to continue',
  },
};

function getLang() {
  const stored = localStorage.getItem(LANG_KEY);
  return stored === 'pt' ? 'pt' : 'en';
}

function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang === 'pt' ? 'pt' : 'en');
  location.reload();
}

function t(key) {
  const dict = I18N[getLang()] || I18N.pt;
  return key in dict ? dict[key] : key;
}

function applyStaticTranslations() {
  document.documentElement.lang = getLang();
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const val = t(el.getAttribute('data-i18n'));
    if (el.hasAttribute('data-i18n-html')) el.innerHTML = val;
    else el.textContent = val;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });
}

function injectLangToggle() {
  const bar = document.getElementById('menubar');
  if (!bar || document.getElementById('lang-toggle')) return;

  const lang = getLang();
  const wrap = document.createElement('div');
  wrap.id = 'lang-toggle';
  wrap.innerHTML =
    `<button type="button" class="lang-btn${lang === 'pt' ? ' active' : ''}" data-lang="pt">PT</button>` +
    `<button type="button" class="lang-btn${lang === 'en' ? ' active' : ''}" data-lang="en">EN</button>`;

  const clock = document.getElementById('mb-clock');
  bar.insertBefore(wrap, clock || null);

  wrap.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  applyStaticTranslations();
  injectLangToggle();
});
