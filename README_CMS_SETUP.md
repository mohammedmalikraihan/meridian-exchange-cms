# Meridian Exchange CMS Setup

This package keeps the current front-end and adds a lightweight CMS backend for:

- Speakers
- Sponsors
- Partners
- Government / regulatory participant logos

## Important hosting note

GitHub Pages can host the front-end only. It cannot run Node.js, SQLite, uploads, or API routes. The CMS backend must be hosted separately on Render, Railway, Fly.io, a VPS, or the Zenith Nexus server.

## Local test

```bash
cd backend
cp .env.example .env
npm install
node seed.js
npm start
```

Open:

```text
http://localhost:3000/admin/
```

Default password is whatever you set in `.env` as `CMS_PASSWORD`.

## Connect the live website to the backend

In `index.html`, update:

```html
<script>window.MERIDIAN_CMS_CONFIG={apiBaseUrl:""};</script>
```

To your backend URL, for example:

```html
<script>window.MERIDIAN_CMS_CONFIG={apiBaseUrl:"https://meridian-cms.onrender.com"};</script>
```

If this value is blank, the website falls back to local JSON files in `/data/` and still works on GitHub Pages.

## Workflow after launch

1. Open `/admin/` on the CMS backend.
2. Add or edit speakers.
3. Upload sponsor/partner/government logos.
4. The front-end automatically pulls active records from the CMS API.

## API endpoints

Public:

- `GET /api/speakers`
- `GET /api/partners`

Admin:

- `GET /api/admin/speakers`
- `POST /api/admin/speakers`
- `PUT /api/admin/speakers/:id`
- `DELETE /api/admin/speakers/:id`
- `GET /api/admin/partners`
- `POST /api/admin/partners`
- `PUT /api/admin/partners/:id`
- `DELETE /api/admin/partners/:id`
- `POST /api/admin/upload`

## Recommended next upgrade

For a high-value B2B summit, replace password-header auth with proper user login before sharing CMS access broadly. This version is suitable for internal Zenith Nexus management.
