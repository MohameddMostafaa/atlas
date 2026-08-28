# Atlas frontend

The React and TypeScript status-page interface for Atlas. During local development, Vite proxies `/api/*` to the FastAPI service on `http://localhost:8000`, removing the `/api` prefix.

```bash
npm ci
npm run dev
npm run lint
npm run build
```

Set `VITE_API_BASE_URL` when the API is hosted somewhere other than the Vite development proxy.
