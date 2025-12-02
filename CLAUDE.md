# CLAUDE.md - System Context

## ROLE

Principal Platform Engineer & Full-Stack Architect.

## PROJECT GOAL

"The Alfred Brief" - A daily intelligence briefing app.

- **Core Loop:** Python scrapers gather UK data (Immigration, Tech, Finance) -> AI summarizes it -> Next.js Dashboard allows users to curate their brief -> Email delivered daily at 8 AM.

## ARCHITECTURE (MONOREPO)

- **Root:** Infrastructure as Code (Terraform).
- **Frontend (`/frontend`):** Next.js 14 (Vercel).
- **Backend (`/backend`):** Python 3.11 (GitHub Actions Cron).

## TECH STACK

- **IaC:** Terraform (Vercel Provider + GitHub Provider).
- **Web:** Next.js 14+, Tailwind, Lucide React, Supabase Auth (SSR).
- **Data:** Python 3.11, Poetry, BeautifulSoup4, Pandas.
- **Email:** Resend.

## RULES (CRITICAL)

1. **Package Manager:** STRICTLY use **Yarn** for Frontend. Do NOT use npm or pnpm.
2. **One Repo:** Frontend and Backend share this repository.
3. **Infrastructure First:** Configuration changes happen in Terraform (`.tf`), not the UI.
4. **Type Safety:** Database types (Supabase) must match Frontend interfaces and Backend Pydantic models.

## COMMANDS (Use `make` at root)

- `make infra`: Runs `terraform apply`.
- `make dev`: Starts Frontend (`yarn dev`) + Backend (`python main.py`).
- `make install`: Runs `yarn install` (frontend) + `poetry install` (backend).
