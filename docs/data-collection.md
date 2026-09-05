# Data Collection

## Goals

1. Collect high-quality English ↔ Urhobo (and later other Nigerian language) pairs from native speakers.
2. Make the data usable for research and eventual model training.
3. Respect consent and avoid collecting unnecessary personal information.

## Contribution types (MVP)

- New translation pairs (source + target text)
- Optional context / explanation
- Optional dialect or location note
- Optional first name or nickname (not required)
- Explicit consent checkbox for research / dataset use

## Status workflow

`pending` → `reviewed` → `accepted` | `rejected`

Only accepted records with consent should enter training datasets.

## Future voice contributions

Schema is defined (`VoiceContribution`) but the upload system is not implemented in the MVP. When added it will pair audio with a transcript and the same consent + status fields.

## Dataset principles

- Prefer quality and verification over volume.
- Version every export.
- Document known limitations and dialect coverage.
- Machine-generated translations are never treated as gold data.

See also `data/README.md` for the JSONL record shape.
