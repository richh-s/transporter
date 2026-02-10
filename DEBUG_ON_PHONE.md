# Debugging the app on the phone (like browser Inspect)

You can inspect the app running on your Android phone using **Chrome DevTools** on your computer, similar to Inspect in the browser. This lets you see CORS errors, network requests, console logs, and response headers.

## Android: Chrome Remote Debugging

### 1. Enable Developer options on the phone

1. Open **Settings → About phone**.
2. Tap **Build number** 7 times until you see “You are now a developer”.

### 2. Enable USB debugging

1. Open **Settings → Developer options**.
2. Turn on **USB debugging**.

### 3. Connect the phone to your computer

- Connect the phone with a USB cable.
- On the phone, when prompted “Allow USB debugging?”, tap **Allow** (and optionally “Always allow from this computer”).

### 4. Open the app on the phone

- Launch your **transporter** app (the one you built with Capacitor).
- Leave it open (e.g. on the sign-in screen where the captcha loads).

### 5. Inspect from Chrome on your computer

1. On your computer, open **Chrome** (same Chrome you use for normal browsing).
2. In the address bar go to: **`chrome://inspect/#devices`**.
3. Under **Remote Target** you should see your device and below it something like **“WebView in com.example.app”** (your app’s package name).
4. Click **“inspect”** under that WebView.

A DevTools window opens. You now have:

- **Console** – `console.log`, errors (including CORS messages like “blocked by CORS policy”).
- **Network** – All requests (e.g. to `dev-api.wetruck.ai`). Click a request to see:
  - Status (e.g. failed, 200).
  - **Headers** (request/response), including CORS headers like `Access-Control-Allow-Origin`, `Access-Control-Expose-Headers`.
- **Application** – Storage, cookies (if any).

### 6. Check for CORS issues

1. Go to the **Network** tab.
2. Trigger the captcha (open sign-in or refresh captcha).
3. Find the request to **`auth/captcha`** (or your API URL).
4. If it fails:
   - Click the request and check **Headers**:
     - Response headers: is there `Access-Control-Allow-Origin`? Does it match your app’s origin?
     - Is `X-Captcha-Id` listed in `Access-Control-Expose-Headers`?
   - In **Console**, look for red errors mentioning “CORS” or “blocked by CORS policy”.

Your app’s origin in the WebView is shown in DevTools (e.g. in the address bar of the inspect window or in the request details). That’s the origin the backend must allow in `Access-Control-Allow-Origin`.

---

## Quick reference

| Step               | Where                                                               |
| ------------------ | ------------------------------------------------------------------- |
| Open inspect UI    | Chrome → `chrome://inspect/#devices`                                |
| Find your app      | Under “Remote Target” → “WebView in com.example.app”                |
| Inspect            | Click **inspect**                                                   |
| See CORS / network | DevTools → **Network** tab, click the failing request → **Headers** |
| See errors         | DevTools → **Console** tab                                          |

This is the same idea as “Inspect” in the browser, but attached to the WebView on your phone.
