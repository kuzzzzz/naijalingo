# NaijaLingo Data

This directory holds seed data, examples, and (later) exported datasets.

## Philosophy

- Prefer high-quality native-speaker contributions over large volumes of noisy machine translations.
- Every record should be versionable and reviewable.
- Consent for research use is required for contributions that enter the training dataset.

## JSONL format (future export)

Each line is a JSON object:

```json
{
  "source_language": "en",
  "target_language": "urhobo",
  "source": "Good morning",
  "target": "...",
  "context": "Greeting used in the morning",
  "dialect": "optional dialect or location note",
  "quality": null,
  "verified": false
}
```

## Versioning & quality control (planned)

- Datasets will be versioned (e.g. `urhobo-en-v0.1.jsonl`).
- Status flow: pending → reviewed → accepted / rejected.
- Only accepted + consented records should enter training sets.
- Native-speaker verification and quality scoring come in later phases.

## Seed / examples

See `examples/` for sample pairs. Seed files can be used for local demos.
