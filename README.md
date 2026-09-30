# Universal Log Pre-processing Framework (ULPF)

ULPF is a deterministic, offline-capable pipeline that transforms raw, heterogeneous logs into verifiable, lossless, self-extending, relationship-aware events. 

## Key Innovations
1. **Tamper-Evident Raw Log Custody:** Blockchain-inspired hash-linked ledger with Merkle proofs for forensic integrity.
2. **Self-Onboarding Parsers:** Plug-and-play inference engine (Drain-style template mining) that writes parsers for unknown formats automatically.
3. **Provable Losslessness:** Exact round-trip byte reconstruction to mathematically prove zero information loss during normalization.

## Setup Instructions

### Prerequisites
- Docker and Docker Compose installed.

### 1. Start the Stack (Air-Gapped Compatible)
Run the following command from the root directory to start the API, PostgreSQL database, and Redis queue:
```bash
docker-compose up --build -d
```

### 2. Verify Services
- API & UI: [http://localhost:8000](http://localhost:8000)

### 3. Run Tests
To verify cryptographic proofs, round-trip losslessness, and the template miner:
```bash
pytest tests/
```

## Directory Structure
- `api/`: FastAPI server and endpoints.
- `custody/`: Hash chains, Merkle trees, and cryptographic block sealing (Feature 1).
- `graph/`: Event Relationship Graph builders.
- `ingest/`: Receivers for syslog, HTTP, and file upload.
- `losslessness/`: Round-trip reconstruction checks and scoring (Feature 3).
- `onboarding/`: Template miner and schema mapper for unseen formats (Feature 2).
- `parsing/`: Declarative regex/JSONPath execution engine.
- `ui/`: React/Tailwind frontend dashboard.
- `tests/`: Automated test suite.
