# HyperPerms Editor

Self-hostable web editor for [HyperPerms](https://hyperperms.com) - a permissions plugin for Hytale servers. Manage groups, users, tracks, and permissions visually in your browser.

## Why Self-Host?

- **Performance** - Run the editor on your local network for zero-latency editing
- **Privacy** - Session data never leaves your infrastructure
- **Customization** - Configure CORS, session TTL, and storage backend

## Quick Start - Docker (Recommended)

```bash
git clone https://github.com/HyperSystemsDev/HyperPermsEditor.git
cd HyperPermsEditor
docker compose up
```

The editor will be available at `http://localhost:3000`. Sessions are stored in Redis for persistence.

## Quick Start - npm

```bash
git clone https://github.com/HyperSystemsDev/HyperPermsEditor.git
cd HyperPermsEditor
npm install
npm run dev
```

No environment variables needed - sessions are stored in-memory by default.

## HyperPerms Plugin Configuration

Point your HyperPerms plugin to your self-hosted editor. In your server's `plugins/HyperPerms/config.json`:

```json
{
  "webEditor": {
    "url": "http://your-editor-host:3000"
  }
}
```

Then run `/hp editor` in-game to create a session.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` | Public URL of the editor (used in session URLs) |
| `REDIS_URL` | No | - | Standard Redis connection string |
| `UPSTASH_REDIS_REST_URL` | No | - | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | No | - | Upstash Redis REST token |
| `ALLOWED_ORIGINS` | No | - | Additional CORS origins (comma-separated) |
| `SESSION_TTL` | No | `86400` | Session time-to-live in seconds (24 hours) |

## Storage Backends

The editor supports three storage backends, selected automatically based on environment variables:

1. **Upstash Redis** (`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`) - Serverless Redis, ideal for cloud deployments
2. **Standard Redis** (`REDIS_URL`) - Self-hosted Redis, ideal for Docker/on-premise
3. **In-Memory** (no env vars) - Zero-config, sessions lost on restart. Great for development.

## Production Tips

- Use a reverse proxy (nginx, Caddy) for HTTPS termination
- Set `NEXT_PUBLIC_APP_URL` to your public HTTPS URL
- Use Redis (not in-memory) for session persistence
- Set `ALLOWED_ORIGINS` if your server communicates from a different domain
- The `/api/health` endpoint can be used for monitoring

## Troubleshooting

**CORS errors when creating sessions**
- Ensure the plugin's `webEditor.url` matches `NEXT_PUBLIC_APP_URL`
- Add the server's origin to `ALLOWED_ORIGINS`

**Sessions disappearing**
- If using in-memory storage, sessions are lost on restart - use Redis instead
- Check `SESSION_TTL` - default is 24 hours

**Cannot connect to Redis**
- Verify `REDIS_URL` format: `redis://host:port` or `redis://:password@host:port`
- For Docker Compose, use `redis://redis:6379` (service name, not localhost)

## License

MIT
