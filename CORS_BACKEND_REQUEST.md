# CORS fix needed for mobile app (Capacitor)

The transporter **mobile app** (Android APK) loads from origin **`https://localhost`** in the WebView.  
API requests to **https://dev-api.wetruck.ai** are blocked by CORS because that origin is not allowed.

## Error we see (in Chrome inspect)

```
Access to fetch at 'https://dev-api.wetruck.ai/api/v1/auth/captcha' from origin 'https://localhost'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
GET https://dev-api.wetruck.ai/api/v1/auth/captcha net::ERR_FAILED 200 (OK)
```

So the server returns **200 OK**, but the browser blocks our app from reading the response because the response does not include CORS headers for our origin.

## What works today

- **Web** (`npm run dev` at `http://localhost:3000`) → works, because the backend already allows that origin (or `http://localhost:3000`).
- **Mobile** (Capacitor app, origin `https://localhost`) → **fails**, because `https://localhost` is not in the allowed origins.

## Change needed on the backend (dev-api.wetruck.ai)

Add **`https://localhost`** to the list of allowed CORS origins for the API.

For responses to requests from the mobile app, the API should send:

- **`Access-Control-Allow-Origin: https://localhost`**  
  **Do not use `*`.** When the app sends cookies/credentials (`credentials: 'include'`), the browser **rejects** `Access-Control-Allow-Origin: *` for security. The server must send the **exact origin** (e.g. `https://localhost`). Using `*` will still block the request.
- **`Access-Control-Allow-Credentials: true`**  
  (because the app uses `credentials: 'include'` for cookies/auth.)
- **`Access-Control-Expose-Headers: X-Captcha-Id`**  
  (so the app can read the captcha ID from the `/auth/captcha` response.)

### Example (conceptual)

If the backend uses a list of allowed origins, add:

- `https://localhost`

So the CORS config might look like (conceptually):

- Allowed origins: `["http://localhost:3000", "https://your-production-domain.com", "https://localhost"]`
- Allow credentials: `true`
- Expose headers: `["X-Captcha-Id"]` (or equivalent for your stack)

### Affected routes

At least these need to allow the above for origin `https://localhost`:

- `GET /api/v1/auth/captcha`
- `POST /api/v1/auth/verify-captcha`
- `POST /api/v1/auth/login`
- Any other API route the mobile app calls (auth, drivers, fleet, ships, etc.)

## Summary for backend team

| Item                         | Value                                                                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| New origin to allow          | **`https://localhost`** (exact value; **not** `*`)                                                                      |
| Reason                       | Capacitor Android app loads the app from this origin in the WebView                                                     |
| Why not `*`?                 | With credentials (cookies), browsers **reject** `Access-Control-Allow-Origin: *`; the spec requires an explicit origin. |
| Allow credentials            | **true** (app sends cookies)                                                                                            |
| Expose headers (for captcha) | **`X-Captcha-Id`**                                                                                                      |

After this change, the mobile app will be able to call the dev API without CORS errors.
