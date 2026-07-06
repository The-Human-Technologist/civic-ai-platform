# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| `0.1.x` (MVP) | ✅ Active development |

Security fixes are applied to the default branch. Release tags will be added when the project reaches `1.0.0`.

---

## Reporting a vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Instead:

1. Email **titasdatta78900@gmail.com** (The Human Technologist)
2. Subject: `[SECURITY] civic-ai-platform — brief description`
3. Include: affected version, reproduction steps, impact assessment, suggested fix (if any)

We aim to acknowledge within **72 hours** and provide an initial assessment within **7 days**.

### Responsible disclosure

- Allow reasonable time to patch before public disclosure.
- Do not access data you do not own or lack authorization to test.
- Do not test against production municipal deployments without written permission.
- Good-faith researchers will not face legal action for compliant disclosure.

---

## What not to commit or upload

| Prohibited | Reason |
|------------|--------|
| API keys, tokens, passwords | Credential leak |
| Real CCTV footage | Privacy violation |
| Video with identifiable faces | GDPR / DPDP / local privacy law risk |
| Unmasked number plates | Personal data |
| Production database dumps | Data breach |
| Municipal system credentials | Unauthorized access |

The repository `.gitignore` excludes `.env*` (except `.env.example`). Use `.env.local` locally.

---

## MVP security posture

This MVP is a **client-side demo**:

- No server authentication
- No encrypted storage of video
- Data persists in browser `localStorage` only
- Mock detections — no real inference

**Do not deploy this MVP as-is to production** without implementing authentication, encryption, access control, and legal review per [ROADMAP.md](ROADMAP.md) Phase 5.

---

## Privacy & security expectations (production)

Future production deployments should implement:

- Role-based access control (viewer / reviewer / admin)
- TLS everywhere
- Encrypted object storage for evidence clips
- Face blurring and plate masking before persistence
- Audit logs for all review and export actions
- Data retention and deletion policies
- DPIA / legal sign-off before processing public CCTV

See [PRIVACY.md](PRIVACY.md).

---

## Dependency security

```bash
npm audit
```

Report supply-chain concerns via the vulnerability email above. We welcome PRs that bump vulnerable dependencies with passing `npm run build`.

---

## Contact

| Purpose | Channel |
|---------|---------|
| Security reports | titasdatta78900@gmail.com |
| General bugs | GitHub Issues (bug template) |
