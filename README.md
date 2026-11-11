# omar-portfolio

Personal portfolio of Omar Mejri: AI & QA Consultant.
Static site: plain HTML, CSS and vanilla JS. No build step, no dependencies.

## Run locally
    python -m http.server 5173
    # then open http://127.0.0.1:5173

(Opening index.html directly from disk also works.)

## Deploy (GitHub Pages)
1. Create a repo named `Mejri1.github.io` and push the contents of this folder.
2. Settings → Pages → Deploy from branch → `main` / root.
3. The site is live at https://mejri1.github.io/

If you deploy elsewhere (Vercel, Netlify, custom domain), replace `https://mejri1.github.io/`
in `index.html` (canonical, og:url, og:image, JSON-LD), `robots.txt` and `sitemap.xml`.

## Updating content
- Text: `index.html` (sections are commented).
- Project case studies (modal): the `PROJECTS` object in `main.js`.
- CV: replace `assets/Omar_Mejri_CV.pdf` (keep the filename).
- After editing CSS/JS, bump `?v=` on the two links in `index.html` so browsers refetch.

## Features
- Light/dark theme (follows system, remembers choice)
- Command palette: Ctrl/⌘ + K or `/`
- Animated spec → test replay, project filters, deep-linkable case studies (`#project-selfheal`)
- SEO: meta + Open Graph image, JSON-LD Person, sitemap, robots
- Accessible: skip link, keyboard navigation, focus states, reduced-motion support
