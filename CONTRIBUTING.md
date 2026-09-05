# Contributing to NaijaLingo

Thank you for helping build better Nigerian language technology.

## Ways to contribute

### 1. Native-speaker translations & corrections
The most valuable contribution right now is accurate English ↔ Urhobo pairs and corrections of existing translations. Use the in-app Contribute page or open an issue with the pair.

### 2. Code
- Keep the MVP small and extensible.
- Prefer clear TypeScript, Zod validation, and the existing provider/schema patterns.
- Do not introduce Docker, Kubernetes, or heavy ML tooling unless the roadmap has reached that phase.
- Open a PR with a short description of what changed and why.

### 3. Documentation & examples
Improvements to README, architecture notes, or sample data are always welcome.

## Development setup

```bash
cp .env.example .env.local
# edit .env.local if you want a real translation provider
npm install
npm run dev
```

The app runs at http://localhost:3000.

## Language & cultural notes

- Never invent Urhobo.
- Prefer natural usage over literal translation.
- Flag uncertainty.
- Native-speaker review is the source of truth.
