# auth/
# Authentication: Bearer Token

## Current Auth (v60)

Simple Bearer Token passed as query parameter or Authorization header:

```
Authorization: Bearer MARVEL-SECRET-TOKEN-2025
# or
?token=MARVEL-SECRET-TOKEN-2025
```

Token is validated on every request in `validateToken_(token)`.

## Token Storage

- **Frontend**: `API_TOKEN` constant in `thai-clinic.html`
- **Backend**: Validated against `settings` sheet (key: `api_token`)
- **Secret**: Stored only in `CLAUDE.local.md` (never commit)

## Finance Page Auth

Finance page has additional password layer:
- Password stored in `settings` sheet (key: `finance_password`)
- Validated client-side via `checkFinancePw()`
- Lock overlay: `id="finance-lock"`

---

## Future Auth (Roadmap — from ปรับปรุง.txt)

### Phase 1: Google OAuth Login
- User must login with Google account (Gmail)
- Only authorized Gmail accounts can access admin settings

### Phase 2: Per-user API Key
- Each user gets an API key linked to their Gmail
- API key stored per-user, not shared
- Managed via Settings page (after Google login)

### Phase 3: Backup/Restore with Email OTP
- Reset database requires email OTP
- OTP sent to logged-in Gmail
- OTP expires in 15 minutes
- Warning: cannot recover data after reset

### Phase 4: Settings Section Password
- Settings section requires password
- Set new password flow
- Recover via logged-in Gmail email

---

## Implementation Notes (Future)

For Google OAuth, will need:
- Google Identity Services (GSI) JS library
- `google.accounts.oauth2.initTokenClient()`
- Verify token server-side via Google API
- Store session client-side (sessionStorage or cookie)
