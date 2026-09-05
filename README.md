# NaijaLingo

**Nigerian language technology, starting with English ↔ Urhobo.**

NaijaLingo aims to build high-quality Nigerian language AI that understands vocabulary, grammar, natural phrasing, local usage, accents, intonation, and cultural context.

This repository is the **MVP foundation**: a working translator plus a community contribution path. It is deliberately small so we can launch, get real native speakers using it, collect data, and then expand.

## Why it exists

Most major language technologies under-serve Nigerian languages. High-quality parallel data and culturally aware systems are scarce. NaijaLingo starts by making a useful English–Urhobo tool and collecting verified native-speaker data that can later power better models.

## Current MVP

- English ↔ Urhobo translation UI
- Provider abstraction (mock by default, OpenAI / Anthropic / xAI when configured)
- Contribution form for translation pairs (with consent for research use)
- Clean TypeScript / Next.js / Tailwind foundation
- Language-agnostic types so more Nigerian languages can be added later

**Important:** Generated translations are **not** authoritative. Native-speaker review and the “Improve this translation” path are first-class.

## Supported languages (MVP)

| Code   | Name    | Native name | Enabled |
|--------|---------|-------------|---------| 
| en     | English | English     | yes     |
| urhobo | Urhobo  | Urhobo      | yes     |

## Architecture (short)

- `apps/web` – Next.js App Router UI + API routes
- `packages/translation` – `TranslationProvider` interface + mock / OpenAI / Anthropic / xAI implementations
- `packages/data` – Zod schemas for contributions and future dataset records
- `packages/shared` – language constants
- `data/` – examples and future exports

See [docs/architecture.md](docs/architecture.md) for more detail.

## How to run locally

```bash
# from repository root
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000.

### Environment variables

| Variable               | Description                                      | Default   |
|------------------------|--------------------------------------------------|-----------|
| `TRANSLATION_PROVIDERS`| Comma-separated ordered fallback list            | `mock`    |
| `XAI_API_KEY`          | xAI / Grok                                       | –         |
| `ANTHROPIC_API_KEY`    | Anthropic / Claude                               | –         |
| `OPENAI_API_KEY`       | OpenAI or compatible                             | –         |

Never commit real API keys. Use `.env.local`.

## How translation providers work

The app never hard-codes a single vendor. It calls `createTranslationProvider()`, which returns whatever is configured.

Supported providers today:
- `mock` – local placeholder (no key needed)
- `openai` – OpenAI or compatible endpoint
- `anthropic` / `claude` – Anthropic Claude
- `xai` / `grok` – xAI Grok (OpenAI-compatible)

Set an ordered fallback list with:

```bash
TRANSLATION_PROVIDERS=xai,anthropic,openai,mock
```

The first provider that succeeds is used. If one fails (rate limit, missing key, outage), the next is tried automatically.

API keys stay in environment variables only (`XAI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`). Never commit real secrets.

Adding a local or custom model later means implementing the same `TranslationProvider` interface and registering it in the factory.

## How contributions work

Users can submit:

- source language / target language
- source text / translated text
- optional context, dialect/location, name
- consent for research use

Records are stored with status `pending`. Later phases will add review, acceptance, and dataset export. Voice contributions are designed in the schema but not implemented yet.

## Dataset philosophy

We want high-quality native-speaker data, not just large piles of machine output. See [docs/data-collection.md](docs/data-collection.md) and [data/README.md](data/README.md).

## Roadmap

See [docs/roadmap.md](docs/roadmap.md).

**Phase 1** (this repo): usable English ↔ Urhobo translator + contribution mechanism.  
Everything else is intentionally later.

## License

MIT – see [LICENSE](LICENSE).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Native speakers and careful translators are especially welcome.
