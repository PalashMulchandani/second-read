# Second Read

**AI ticket auditor for Freshservice teams.**

Every dashboard tracks how fast tickets close. None of them ask if they should have.

Second Read runs as a background audit service: four AI agents (Verifier, Pattern, Sentiment, Timing) re-read every resolved ticket, flag false resolutions and silent drop-offs, and feed confirmed flags back into Freshservice with one-click reopen — plus a weekly manager briefing with cost impact.

## Running locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default http://localhost:5173).

## Demo flow

1. **Landing page** — hook line + product mockup, features, architecture, stats
2. **Dashboard** — silent drop-off banner + flagged tickets table
3. **Impact** — Before / After Second Read + false-resolution trend chart
4. **Cluster Map** — root-cause clusters with duplicate tickets
5. **Ticket Detail** — conversation, AI reasoning trail, auto-reopen / escalate actions
6. **Reports** — weekly briefing (voice playback UI), trend, top issues, feedback accuracy

## Tech

Vite + React 19 + TypeScript + Tailwind CSS v4 + Recharts. Figma Make export origin: [Design Second Read SaaS App](https://www.figma.com/design/SI1sdTji2Yf8aqDee0BsoX/Design-Second-Read-SaaS-App).
