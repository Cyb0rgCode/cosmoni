# Cosmoni — Client Tracker

A simple installable PWA for tracking clients and their trimester payments. Built with Next.js, TypeScript, and Tailwind CSS. Data is stored locally in the browser (`localStorage`) — no backend or database required.

## Features

- **Dashboard** — totals for paid/unpaid clients, amount collected, amount outstanding, and overdue clients.
- **Clients** — card view or list view (toggle in the top bar), with search and paid/unpaid filters.
- Track per client: name, post/role, phone number, Instagram username, and payment status.
- **Pricing logic**: 25 DT per trimester. If a client hasn't paid within 15 days of the trimester start, the rate becomes 35 DT.
- **PWA**: installable on mobile home screens, works offline via a service worker (app shell cached).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

Push this repo to GitHub and import it in [Vercel](https://vercel.com/new) — no environment variables or database setup needed, it just works out of the box. After deploying, open the site on a phone and use "Add to Home Screen" to install it as an app.

## Data

All client data lives in the browser's `localStorage` (key `cosmoni.clients.v1`). Clearing browser data / site data will remove all clients, so this is intended for single-device personal use.
