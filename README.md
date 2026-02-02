This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Connecting the backend

The app talks to your backend using the **API base URL** from environment variables.

### 1. Set the API URL

1. Copy the example env file:
   ```bash
   cp .env.example .env.local
   ```
2. Edit `.env.local` and set your backend URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

   - **Web (same machine):** `http://localhost:8000/api/v1` or `http://127.0.0.1:8000/api/v1`
   - **Capacitor (device/emulator):** use your computer's LAN IP so the device can reach the backend, e.g. `http://192.168.1.100:8000/api/v1`
   - **Production:** your HTTPS API URL, e.g. `https://api.yourdomain.com/api/v1`

### 2. Rebuild after changing the URL

`NEXT_PUBLIC_API_URL` is baked in at **build time**. After changing it:

- **Web:** restart dev server (`npm run dev`) or run `npm run build` for production.
- **Capacitor:** run `npm run build`, then sync: `npx cap sync`.

### 3. Backend requirements

- **CORS:** Allow requests from your app's origin (e.g. `http://localhost:3000` in dev, or your Capacitor app origin in production).
- **Cookies:** The app uses `credentials: "include"` for auth; your API must allow credentials and set cookies with a compatible `SameSite` (e.g. `Lax` or `None` + `Secure` for cross-site).
- **Base path:** The app expects the API at `{NEXT_PUBLIC_API_URL}/...` (e.g. `/auth/login`, `/driver`, `/truck`, `/ship`, etc.). Ensure your backend serves those routes under `/api/v1` (or whatever base path you set).

### Quick check

1. Set `NEXT_PUBLIC_API_URL` in `.env.local`.
2. Run `npm run dev` and open the app in the browser.
3. Sign in or trigger any API call; check the browser Network tab to confirm requests go to your backend URL.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
