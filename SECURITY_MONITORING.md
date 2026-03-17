# Security Monitoring Links

Use these URLs to monitor security posture and abuse pressure.

## App Endpoints (Production)

- Rate limit pressure and 429 trends (admin auth required):  
  `https://track.itshassanahmed.com/api/admin/security`
- System health and env checks (admin auth required):  
  `https://track.itshassanahmed.com/api/admin/system`
- Platform-wide event volume/errors (admin auth required):  
  `https://track.itshassanahmed.com/api/admin/events`
- Business/user stats (admin auth required):  
  `https://track.itshassanahmed.com/api/admin/stats`

### Useful Query Variants

- Top 50 pressured scopes:  
  `https://track.itshassanahmed.com/api/admin/security?top=50`
- Top 100 pressured scopes (max):  
  `https://track.itshassanahmed.com/api/admin/security?top=100`

## App Endpoints (Local Development)

- `http://localhost:3000/api/admin/security`
- `http://localhost:3000/api/admin/system`
- `http://localhost:3000/api/admin/events`
- `http://localhost:3000/api/admin/stats`

## Infrastructure Dashboards

- Supabase logs (Auth/API/DB):  
  `https://supabase.com/dashboard/project/orlvumlhbolgvpfslrnj/logs/explorer`
- Supabase database policies (RLS audit):  
  `https://supabase.com/dashboard/project/orlvumlhbolgvpfslrnj/database/policies`
- Supabase API keys/secrets rotation:  
  `https://supabase.com/dashboard/project/orlvumlhbolgvpfslrnj/settings/api`
- Contabo server logs (replace service names with your actual ones):
  - Nginx access log: `sudo tail -f /var/log/nginx/access.log`
  - Nginx error log: `sudo tail -f /var/log/nginx/error.log`
  - PM2 app logs: `pm2 logs <your-app-name>`
  - Systemd app logs: `sudo journalctl -u <your-service-name> -f`
  - Docker app logs (if used): `docker logs -f <your-container-name>`

## Recommended Alerting

- Alert when `totals.blocked` in `/api/admin/security` spikes above baseline.
- Alert on sudden increases in:
  - `api:webhook-ingest`
  - `api:team-verify-invite`
  - `api:team-accept-invite`
  - `api:admin`
- Alert on repeated 401/403/429 patterns in server logs and Supabase logs.
