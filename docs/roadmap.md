# Roadmap

## Phase 1 – English ↔ Urhobo translation MVP
- Working translator UI
- Provider abstraction
- Mock + real LLM providers (OpenAI, Anthropic, xAI) with fallbacks
- Clear non-authoritative messaging

## Phase 2 – Community translation contributions
- Contribution form
- Basic storage + status (pending / reviewed / accepted / rejected)
- Consent for research use

## Phase 3 – Native-speaker verification and quality scoring
- Review interface for trusted native speakers
- Quality scores and verification flags
- Feedback loop into the translator (“Improve this translation”)

## Phase 4 – Voice contribution / collection
- Audio upload + transcript pairing
- Dialect / speaker metadata (minimal)
- Consent handling

## Phase 5 – High-quality curated Nigerian language dataset
- Versioned JSONL exports
- Clear quality gates
- Documentation for researchers

## Phase 6 – Fine-tuned / custom Nigerian language models
- Train or adapt models on accepted data
- New provider implementation that uses the custom model
- Evaluation against native-speaker gold data

## Phase 7 – Additional Nigerian languages
- Isoko, Itsekiri, Edo, Igbo, Yoruba, Hausa, and others
- Language-agnostic architecture already in place

---

**Guiding principle:** Ship a usable English–Urhobo translator and a contribution path first. Let real native speakers guide the next priorities.
