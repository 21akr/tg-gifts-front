# Stargift — Frontend

The web UI for Stargift, a self-hosted Telegram Star Gift sender.

This repo holds **only the frontend**. To run the whole app, follow the
guide in the backend repo:
**https://github.com/v21akr/tg-gifts-backend** (one Docker command).

---

## Local dev

```bash
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5173` and proxies `/api/*`
to the backend at `http://localhost:3000`. Run the backend separately
(see its README).


## Stack

- React 18 + TypeScript
- Vite
- `lottie-react` + `pako` for `.tgs` sticker playback
- Plain CSS (no framework)
