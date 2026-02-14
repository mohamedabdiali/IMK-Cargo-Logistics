# Cargo & Logistics Portal

React + Vite application for cargo clearing, forwarding, tracking, and admin operations.

## Local development

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
npm run preview
```

## GitHub Pages deployment

This repo is configured for GitHub Pages using GitHub Actions:

- Workflow file: `.github/workflows/deploy-pages.yml`
- Deploy trigger: push to `main`
- SPA fallback: generated as `dist/404.html`
- Base path: auto-set to `/<repo-name>/` during CI

### One-time setup in GitHub

1. Create a GitHub repository.
2. In repository settings, go to `Pages`.
3. Ensure source is set to `GitHub Actions`.

### Push this project to GitHub

```sh
git init -b main
git add .
git commit -m "Prepare cargo platform for GitHub deployment"
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

After push, GitHub Actions will deploy and publish the site URL in the workflow run.
