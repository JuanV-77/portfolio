# juanvazquez.dev — portfolio

Personal site for Juan D. Vazquez — Data Engineer. A scroll ascent from a Kansas
sunset into deep space, with every job, project, and research paper playing back
live on animated canvas screens.

## Editing content

Everything editable lives in **`src/data.js`** — jobs, tabs, captions, stats,
projects, research, skills, certs, interests, albums, nav labels. Change it,
commit, push: the site redeploys automatically.

- Scene animations: `src/scenes.js` (one rAF loop paints every `canvas[data-scene]`)
- Layout/sections: `src/App.jsx`
- Email subscribers: paste a Formspree/Buttondown endpoint into `SUBSCRIBE_ENDPOINT` in `src/App.jsx`

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
```

## Deploying

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and
publishes to GitHub Pages.
