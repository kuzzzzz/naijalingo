# Architecture

NaijaLingo MVP is intentionally simple and extensible.

## High-level layout

```
/
├── apps/web          # Next.js App Router frontend + API routes
├── packages/
│   ├── translation   # Provider abstraction + implementations
│   ├── data          # Zod schemas for contributions & dataset records
│   └── shared        # Language types & constants
└── data/             # Seed, examples, future exports
```

## Translation engine

- Application code depends only on the `TranslationProvider` interface.
- Current providers: `mock` (default for local dev), `openai`, `anthropic`/`claude`, `xai`/`grok`.
- Switching / fallback is done via `TRANSLATION_PROVIDERS` env var (comma-separated ordered list).
- Future providers (local model, Hugging Face, custom NaijaLingo model) can be added without touching UI or API route logic.

## API surface (REST)

- `POST /api/translate` – run a translation through the configured provider
- `POST /api/contribute` – submit a translation pair (stored in-memory for MVP; replace with Postgres later)

## Data layer

- Schemas live in `@naijalingo/data`.
- MVP stores contributions in memory so the contribution flow works without requiring a database.
- PostgreSQL-ready: the shape of `TranslationContribution` is designed to map cleanly to a table later.
- Dataset export will use JSONL records defined in the same package.

## Language support

- Languages are first-class objects (`Language { code, name, nativeName, enabled }`).
- Currently enabled: English (`en`), Urhobo (`urhobo`).
- Adding another Nigerian language later is mostly configuration + data collection.

## What is deliberately not built yet

- Full voice upload pipeline
- Production database / auth / moderation queue
- Model training infrastructure
- Microservices, Docker, Kubernetes
