# CORS for Capacitor (mobile) app

When the app runs on a phone via Capacitor (APK), it loads from a different **origin** than the browser (e.g. `https://localhost` or `capacitor://localhost`). Requests to your API (e.g. `https://dev-api.wetruck.ai`) are then **cross-origin**, so the API must allow them via CORS.

## If CAPTCHA (or other API calls) fail only on the phone

Your backend must allow the app’s origin and expose the headers the app needs.

### 1. Allow the app origin

For the Capacitor Android app (with `androidScheme: "https"`), the origin is typically:

- `https://localhost`

So the API should send, for the relevant routes:

- `Access-Control-Allow-Origin: https://localhost`
- `Access-Control-Allow-Credentials: true` (because the app sends cookies with `credentials: 'include'`)

You cannot use `Access-Control-Allow-Origin: *` when credentials are sent; it must be the exact origin.

### 2. Expose CAPTCHA header

The CAPTCHA image response must expose the `X-Captcha-Id` header so the app can read it:

- `Access-Control-Expose-Headers: X-Captcha-Id`

(Or the lowercase variant your server uses, e.g. `x-captcha-id`.)

Without this, the browser/WebView hides the header and the app cannot get the captcha ID.

### 3. Example (conceptual)

For `GET /api/v1/auth/captcha` (and any other route the app calls), the response should include something like:

```http
Access-Control-Allow-Origin: https://localhost
Access-Control-Allow-Credentials: true
Access-Control-Expose-Headers: X-Captcha-Id
```

Adjust the origin if your Capacitor config uses a different scheme/host (e.g. a custom scheme).

## Checking the app’s origin

In the Capacitor app, you can log the origin in the sign-in (or any) screen:

```js
console.log("origin", window.location.origin);
```

Use that value as `Access-Control-Allow-Origin` on the backend.
