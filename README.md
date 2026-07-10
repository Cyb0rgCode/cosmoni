# Cosmoni — Client Tracker

A simple installable PWA for tracking clients and their trimester payments. Built with Next.js, TypeScript, and Tailwind CSS. Client data is stored in Vercel Blob storage (cloud), behind a single shared password.

## Features

- **Password-protected** — a single shared password (env var) gates the whole app.
- **Dashboard** — totals for paid/unpaid clients, amount collected, amount outstanding, and overdue clients.
- **Clients** — card view or list view (toggle in the top bar), with search and paid/unpaid filters.
- Track per client: name, post/role, phone number, Instagram username, and payment status.
- **Sorting**: sort the client list by name (A–Z/Z–A), amount due, status (overdue first), or date added.
- **Posts**: pick a client's post from a managed list (seeded with common committee roles), with an in-form "Manage" screen to add or delete posts from that list.
- **Trimester ledger**: billing periods run Jul–Sep, Oct–Dec, Jan–Mar, Apr–Jun (tracking starts July 2026). Each trimester keeps its **own independent record** of who paid — switching to view an earlier trimester never recalculates or changes it, it's a pure read of what actually happened.
- **Pricing logic**: 25 DT per trimester. If a client hasn't paid within 20 days of that trimester's start, the rate becomes 35 DT.
- **Compounding penalty**: advancing to a *new* trimester (one that hasn't happened yet) is the only time anything is calculated. Anyone still unpaid when the closing trimester ends carries a flat 35 DT penalty into the new one, stacking with any earlier unpaid balance, on top of the new trimester's own 25/35 DT fee. Paying in full resets that client's carry-over to 0. New clients are only ever added to the current trimester going forward — they don't retroactively appear in past ones. Past trimester records can still be corrected (e.g. fixing a missed "mark as paid"), but corrections never ripple forward into later trimesters' totals.
- **PWA**: installable on mobile home screens, with an app-shell service worker for fast loads.
- **Cloud storage**: all client records live in a single JSON file in Vercel Blob — no localStorage, accessible from any device.
- **Backup/restore**: small "Export data" / "Import data" links at the bottom of the Dashboard. Export downloads the full backing data (every client, every trimester's payment history, and the posts list) as JSON; Import replaces all current data with the contents of a previously exported file, behind a confirmation.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `APP_PASSWORD` | Yes | The shared password used to log in. Anyone with this password (and a valid session cookie) can view/edit all client data. |
| `BLOB_READ_WRITE_TOKEN` | Yes | Read/write token for Vercel Blob storage. |

### Setting up Vercel Blob (free)

1. In your Vercel project, go to **Storage** → **Create Database** → **Blob**.
2. Connect it to this project. Vercel automatically adds `BLOB_READ_WRITE_TOKEN` to your project's environment variables — no extra setup needed.
3. The Hobby (free) plan includes a monthly allowance that's more than enough for this app (a single small JSON file).

### Setting `APP_PASSWORD`

In your Vercel project settings → **Environment Variables**, add `APP_PASSWORD` with whatever password you want to use to log in. Redeploy after adding it.

### Local development

Create a `.env.local` file:

```bash
APP_PASSWORD=choose-a-password
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token   # from Vercel Storage settings, or `vercel env pull`
```

Then:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with `APP_PASSWORD`.

## Deploy on Vercel

Push this repo to GitHub and import it in [Vercel](https://vercel.com/new), then set the two environment variables above (add the Blob store first so `BLOB_READ_WRITE_TOKEN` is injected automatically). After deploying, open the site on a phone and use "Add to Home Screen" to install it as an app.

## Data & security notes

- All client data (name, phone, Instagram, payment status) is stored as a single JSON blob in Vercel Blob, read/written by server-side API routes — the browser never talks to Blob directly.
- The blob is stored with `access: "private"`, so it requires the `BLOB_READ_WRITE_TOKEN` to read — it isn't reachable via a bare URL even if leaked.
- Login uses a single shared password (no individual accounts) and an HTTP-only session cookie valid for 30 days. This is meant for personal/single-operator use, not a multi-user product.
