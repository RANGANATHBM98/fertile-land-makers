# Agri App API

FastAPI backend for annual per-acre land listings, owner verification and listing fees, paid farmer contact/chat, and customer support.

## Local setup

Run these commands from `backend/` in PowerShell:

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python -m uvicorn app.main:app --reload
```

The API is at `http://localhost:8000`; interactive API documentation is at `/docs`. SQLite data and uploaded files are created under `backend/`. The API creates tables on startup for local development.

Create the first administrator in a separate terminal, also from `backend/`:

```powershell
python -m app.create_admin admin@example.com "Platform Admin" "+919876543210"
```

The command prompts for the password. Do not expose an admin role through public registration.

## Main workflow

1. Register as `owner` or `farmer` at `POST /api/auth/register`; use the returned bearer token for protected routes.
2. Owners create a listing with `POST /api/lands`, upload up to six public land photos, and submit private ownership evidence using `kind=land_ownership` and `land_id`. Exact coordinates are optional and are never included in public listing responses.
3. An administrator reviews the ownership proof. Approval starts the verification stages: `callback_required` → `callback_completed` → `field_visit_scheduled` → `field_verified`, updated through `PUT /api/admin/lands/{id}/verification`. Record call/visit notes without entering Aadhaar numbers.
4. After proof approval, the owner pays the per-acre listing fee through `POST /api/lands/{id}/listing-fee-order`. The default is ₹50 per acre (`OWNER_LISTING_FEE_PER_ACRE_PAISE=5000`); fractional acreage is prorated and rounded to the nearest paise. Only after payment and field verification can an administrator approve the listing.
5. Farmers submit a non-Aadhaar photo ID for manual review using `kind=identity_proof` and `attest_non_aadhaar=true`. After approval, a farmer accepts contact-sharing consent and pays the configured one-time per-listing fee. The exact address/map pin and owner contact are then available, and the farmer and owner can message each other in a private listing thread.
6. Razorpay orders, signatures, provider capture, amount/currency, and signed webhooks are checked before access or listing-fee status changes. The default contact fee is ₹15; `CONTACT_UNLOCK_FEE_PAISE` accepts 1000–2000 paise.
7. `/help` provides deterministic FAQ answers and authenticated support tickets. Staff can review and answer tickets from the admin panel.

## API notes

- Owners enter annual rent per acre. The API stores that rate and calculates the rounded annual total for the full listing; public listings and price filters use the total. Lease duration remains a separate minimum-duration field.
- Existing databases with `monthly_rent_inr` are migrated at startup: the column is renamed to `annual_rent_inr` and existing whole-land monthly values are multiplied by 12. Back up production data before deploying this change.
- `water_sources`, crop history/crops, irrigation, electricity, owner-reported fertilizer/pesticide history, soil-test summary, drainage, road access/type, transport access, district/state, and lease duration are stored. These agricultural details are owner-reported, not certifications.
- The owner can pin coordinates using browser location permission or manual coordinates. Precise coordinates are returned only to the owner, an administrator, or a farmer with a captured contact grant. The frontend uses an OpenStreetMap embed and a Google Maps deep link; no Maps API key is currently required or configured.
- Private chat endpoints require a contact grant for the exact farmer/owner/listing pair. Support tickets are private to their creator; only administrators can view/respond to all tickets.
- Public photos are served from `/media/`. Private proofs are not mounted as static files and can only be retrieved by an administrator through the authenticated review endpoint.
- The callback and field-visit workflow is manual; this app does not fetch Pahani/revenue/tax records or claim that a document alone proves legal title. Availability and access to land records depend on the launch state and its approved provider. Do not collect Aadhaar numbers/cards. Aadhaar verification must use a properly authorized KYC/DigiLocker provider after onboarding and consent review.
- Razorpay is disabled until credentials are configured. Put the test/live key ID, secret, webhook secret, and fee values in `backend/.env` or a deployment secret manager; never in source code. In Razorpay Dashboard, configure `/api/payments/razorpay-webhook` and subscribe to `payment.captured`. The current `.env.example` documents all required names.
- Production settings require PostgreSQL, HTTPS frontend origins, a strong JWT secret, and a webhook secret when Razorpay is enabled. The API adds security headers. Before launch, also use encrypted private object storage, a malware scanner, rate limiting/WAF, admin MFA, phone/email OTP, monitoring, audit retention, tested backups, and formal versioned migrations. Local SQLite and filesystem storage are development-only.
- SMS/OTP, email notifications, automatic state land-record fetching, and authorized KYC are not wired because each needs a provider account, launch-state access, and approved credentials. Do not supply production secrets in chat; configure them directly in the deployment secret manager after provider onboarding.
