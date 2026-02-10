# Backend: Auth cookies for mobile app (Capacitor)

The mobile app loads from origin `https://localhost` and calls `https://dev-api.wetruck.ai`. Auth uses cookies. Because this is **cross-site**, cookies with default `SameSite=Lax` are **not sent** → 401 → user is logged out.

---

## Change required

Set all auth-related cookies with **`SameSite=None`** and **`Secure`** so they are sent on cross-site requests.

---

## Cookies to update

| Cookie name(s)                           | Used for               | Fix                                       |
| ---------------------------------------- | ---------------------- | ----------------------------------------- |
| `refresh_token` (or similar)             | Token refresh          | `SameSite=None; Secure; HttpOnly; Path=/` |
| `access_token` / session cookie (if any) | Authenticated requests | `SameSite=None; Secure; HttpOnly; Path=/` |

Add these attributes to any cookie set by login, refresh, or auth-related endpoints.

---

## Example (conceptual)

**Before (not sent cross-site):**

```
Set-Cookie: refresh_token=xxx; HttpOnly; Path=/
```

**After (sent cross-site):**

```
Set-Cookie: refresh_token=xxx; SameSite=None; Secure; HttpOnly; Path=/
```

---

## Endpoints that set cookies

- `POST /api/v1/auth/login` – sets auth cookies on success
- `POST /api/v1/auth/refresh` – sets new cookies on refresh

Ensure all `Set-Cookie` responses from these endpoints include `SameSite=None; Secure`.

**Note:** `Secure=True` is required when using `SameSite=None`. The API must be served over HTTPS (which it is: dev-api.wetruck.ai).

---

## Summary

| Setting  | Value                      |
| -------- | -------------------------- |
| SameSite | `None`                     |
| Secure   | `true`                     |
| HttpOnly | `true` (for refresh_token) |
| Path     | `/`                        |

Apply to all auth cookies. CORS (`Access-Control-Allow-Origin: https://localhost`, `Access-Control-Allow-Credentials: true`) is already correct.
