# maccy

Online shop for MACCY COLLECTIONS, built with Next.js and Tailwind CSS.

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the admin values (see below)
npm run dev
```

Open http://localhost:3000.

## Admin

The admin area is not linked from the public site. Open `/maccyadmin` or press `Ctrl+Alt+.`.

Set these in `.env.local` (server-only):

- `ADMIN_EMAIL` and optional `ADMIN_USERNAME`: what you sign in with
- `ADMIN_PASSWORD_HASH`: create with `npm run admin:password -- "YourPassw0rd!"`
- `ADMIN_SESSION_SECRET`: a random 64-character hex string

Three wrong sign-in attempts lock the admin for 30 minutes.
