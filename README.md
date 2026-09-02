# Mallax Vision — Merchant Face Verification Demo

Portfolio MVP that adds a **face verification step** after merchant login, then unlocks a mock Shopify returns dashboard. It is a demonstration, not a production authentication system.

## Demo credentials

| Field | Value |
| --- | --- |
| Email | `merchant@mallax.demo` |
| Password | `DemoPass123!` |

Use **Fill demo account** on the sign-in page, or enter the values above.

## Setup

1. Install [Node.js](https://nodejs.org/) 20+ (LTS recommended).
2. Clone or open this folder.
3. Install dependencies and copy environment variables:

```bash
npm install
copy .env.example .env.local
```

On macOS/Linux use `cp .env.example .env.local`.

4. Start the app:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000).

The demo runs with a **mock face-comparison provider** until you connect your own endpoint.

Replace `public/demo/reference-face.jpg` with the enrolled merchant photo you want compared against webcam captures.

## Connecting your face-comparison API

Secrets stay on the server. The browser only talks to `/api/verify-face`. That route loads the reference image, calls your API, discards the capture, and returns a normalized result.

1. Open `.env.local`.
2. Set `FACE_COMPARISON_USE_MOCK=false`.
3. Fill in at least:

```env
FACE_COMPARISON_API_URL=https://your-api.example/compare
FACE_COMPARISON_API_KEY=your-secret-if-required
```

4. Align request field names with your contract:

```env
FACE_COMPARISON_REQUEST_FORMAT=multipart   # or json
FACE_COMPARISON_CAPTURED_IMAGE_FIELD=probe_image
FACE_COMPARISON_REFERENCE_IMAGE_FIELD=reference_image
```

5. Align response mapping (dot-paths are supported):

```env
FACE_COMPARISON_RESPONSE_SCORE_PATH=score
FACE_COMPARISON_RESPONSE_MATCH_PATH=match
FACE_COMPARISON_MATCH_THRESHOLD=0.7
```

Examples:

- `data.similarity`
- `result.is_match`

If your API has no explicit match boolean, leave `FACE_COMPARISON_RESPONSE_MATCH_PATH` set to a missing path and the app will treat `score >= threshold` as a match.

Optional extras:

| Variable | Purpose |
| --- | --- |
| `FACE_COMPARISON_API_KEY_HEADER` | Header name for the key (default `Authorization`) |
| `FACE_COMPARISON_API_KEY_PREFIX` | Prefix such as `Bearer ` |
| `FACE_COMPARISON_EXTRA_JSON` | Extra JSON merged into the request |
| `FACE_COMPARISON_REFERENCE_IMAGE_PATH` | Local enrolled photo |
| `FACE_COMPARISON_REFERENCE_IMAGE_URL` | Remote enrolled photo |
| `FACE_COMPARISON_SEND_REFERENCE_AS_URL` | Send the reference field as a URL string |
| `FACE_COMPARISON_MOCK_MATCH` | `true`/`false` while mock mode is on |

If the payload shape is more nested than field-name mapping allows, edit only:

- `src/lib/face-comparison/adapter.ts` — look for the `TODO` comments
- `src/lib/face-comparison/config.ts` — environment loading

The UI and `/api/verify-face` should not need to change.

## Architecture and verification flow

```
Browser                Next.js server                 Your API (optional)
------                 --------------                 -------------------
Login form      →      POST /api/login
                       (demo credentials, httpOnly session)

Verify page     →      camera capture (in memory)
                →      POST /api/verify-face
                       load reference image
                       adapter maps request     →    face comparison
                       adapter maps response    ←
                       if match: mark session verified
                       captured bytes are not written to disk

Dashboard       ←      allowed only when session.faceVerified
```

Key files:

| Path | Role |
| --- | --- |
| `src/lib/face-comparison/` | Isolated comparison client, mock, and adapter |
| `src/app/api/verify-face/route.ts` | Server proxy; keeps API keys off the client |
| `src/lib/merchants.ts` | Demo merchant and mock Shopify return stats |
| `src/lib/session.ts` | Signed httpOnly session cookie |
| `src/proxy.ts` | Route protection for `/verify` and `/dashboard` |

## Privacy

This app is a demonstration. Captured webcam images are used only for the in-flight verification request and are not saved to disk or a database. Do not retain biometric data longer than needed to complete a comparison.

## Scripts

```bash
npm run dev     # local development
npm run build   # production build
npm run start   # run the production server
```
