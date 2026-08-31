# HealMesh

Autonomous self-healing infrastructure platform — marketing site, login and control-center dashboard.

## Stack
React 19 + TanStack Start (TanStack Router) + Vite + Tailwind CSS v4.

## Getting started
```bash
npm install
npm run dev      # http://localhost:8080
npm run build
```

## Structure
- `src/routes/index.tsx` — landing page
- `src/routes/login.tsx` — split-screen sign in with animated mesh
- `src/routes/dashboard.tsx` — control center
- `src/components/healmesh/` — mesh visualization + data
- `src/styles.css` — design tokens (palette, type, motion)
