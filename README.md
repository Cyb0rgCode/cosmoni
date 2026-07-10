# Cosmoni — Client Tracker

A simple installable PWA for tracking clients and their trimester payments. Built with Next.js, TypeScript, and Tailwind CSS. Client data is stored in Vercel Blob storage (cloud), behind a single shared password.

## Features

- **Password-protected** — a single shared password (env var) gates the whole app.
- **Dashboard** — totals for paid/unpaid clients, amount collected, amount outstanding, and overdue clients.
- **Clients** — card view or list view (toggle in the top bar), with search and paid/unpaid filters.
- Track per client: name, post/role, phone number, Instagram username, and payment status.
- **Trimester cycle**: billing periods run Jul–Sep, Oct–Dec, Jan–Mar, Apr–Jun (anchored on July). The Dashboard shows the active trimester with a selector to switch to a nearby one.
- **Pricing logic**: 25 DT per trimester. If a client hasn't paid within 20 days of the trimester start, the rate becomes 35 DT.
- **Compounding penalty**: switching to a new trimester resets everyone to unpaid, but any client who was still unpaid carries their full owed amount (fee + prior carry-over) into the new trimester, stacking on top of that period's fee. Paying in full clears the carry-over.
- **PWA**: installable on mobile home screens, with an app-shell service worker for fast loads.
- **Cloud storage**: all client records live in a single JSON file in Vercel Blob — no localStorage, accessible from any device.

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
