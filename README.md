# 🖥️ Vidi.deV Portfolio — A Mac OS System 7 Desktop, Rebuilt as a Website

> My first portfolio site — a working desktop environment inspired by classic Mac OS System 7, complete with draggable windows, dropdown menus, a terminal boot sequence and two built-in arcade games.

**🎮 [Live Demo](https://vidipt89.github.io/iWeb/)**

"iWeb" is a browser-based recreation of the classic Mac OS System 7 desktop — built with vanilla HTML, CSS and JavaScript, no frameworks, no build step. Double-click icons to open draggable, resizable windows for About Me, Projects, Skills and Contact, browse a live feed of my GitHub repositories, or boot up a terminal easter egg. Two playable arcade games — Pac-Man and Super Mario Bros — are tucked into the Special menu.

## 📦 What's Inside

- 🖱️ A fully interactive System 7-style desktop — draggable/resizable windows, a real menu bar with dropdowns, a right-click context menu and a boot splash screen
- 👤 About, Skills and Contact windows with my bio, background and contact details
- 📁 A Projects window that pulls my repositories live from the GitHub API, split into "My Projects" and "Forks"
- ⌨️ A Terminal window with an animated boot/typing sequence
- 🕹 🍄 Two playable arcade games built on `<canvas>`: Pac-Man and Super Mario Bros
- 🇵🇹 🇬🇧 One-click language toggle between European Portuguese and English, remembered between visits, covering the entire interface — menus, dialogs, windows and games
- 🗂️ Standalone `about.html`, `projects.html`, `skills.html` and `contact.html` pages that mirror the desktop windows for direct linking and bookmarking
- 🖥️ Retro chrome — platinum window frames, striped title bars, pixel-style icons — all built in CSS, no image assets

## 🛠️ Tech Stack

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

## 🏗️ Project Structure

```
iWeb/
├── index.html      # Desktop shell — menu bar, icons, dropdowns, boot screen
├── about.html       # Standalone About Me page
├── projects.html     # Standalone Projects page (live GitHub feed)
├── skills.html       # Standalone Skills page
├── contact.html      # Standalone Contact page
├── app.js             # Window manager, content builders, terminal, Pac-Man & Mario engines
├── page.js            # Shared window/menu logic for the standalone pages
├── i18n.js             # PT-PT / EN dictionary, language toggle and translation engine
├── style.css           # System 7 theme, window chrome, retro styling
├── LICENSE              # MIT License
└── README.md
```

## 🌐 Language

Every string on the site — menus, dialogs, window content and game overlays — ships in both European Portuguese and English through a small `i18n.js` module. The chosen language is saved in `localStorage` and applied instantly across the desktop windows and every standalone page.

## 🚀 How to Run

```bash
# 1. Clone the repository
git clone https://github.com/VidiPT89/iWeb.git

# 2. Open index.html in your browser
cd iWeb
open index.html    # macOS
# or: start index.html (Windows) / xdg-open index.html (Linux)
```

No build step, no dependencies — it's static HTML/CSS/JS and can also be served with any static file server (e.g. `python3 -m http.server`).

## 📝 Notes

- This was my first portfolio site, so it's no longer up to date — my current portfolio lives at [ividi.dev](https://ividi.dev/)
- The Projects window/page fetches my repositories live from the GitHub API, so it always reflects my latest work
- Language preference is stored in `localStorage`, so it persists between visits

---

Developed by **David Arsénio Martins**
