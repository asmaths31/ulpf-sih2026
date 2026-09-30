# ULPF — Universal Log Pre-processing Framework

> **From raw bytes to court-ready evidence. Zero manual regex. 100% lossless. Cryptographically sealed.**

Built for **Smart India Hackathon 2026** — a vendor-agnostic, fully containerized framework that ingests, parses, normalizes, and standardizes logs from any hardware or software system at scale.

---

## ✨ Three Core Differentiators

| | Feature | What It Does |
|---|---|---|
| 🔍 | **Self-Onboarding Parsers** | Feed 50 sample lines → AI infers the log structure using Drain-style template mining. No manual regex ever. |
| 🔁 | **Provable Losslessness** | Every parser is mathematically reversible. Raw bytes are reconstructable from JSON + residuals. Exact Round-Trip Rate = **100%**. |
| 🔒 | **Tamper-Evident Custody** | Every event is hashed and sealed into signed Merkle blocks. Any single-byte alteration is cryptographically detected — court-admissible evidence. |

---

## 🖥️ Live Demo (Prototype)

The interactive prototype demonstrates all three features end-to-end with a **4-step automated pipeline** — no manual interaction required:

1. **Auto-Onboarding** — AI mines a parser template from raw sample logs
2. **Losslessness Scorecard** — Proves 100% reversibility with side-by-side raw vs reconstructed view
3. **Tamper-Evident Custody** — Merkle chain verified; Windows AD Controller auto-triggers a simulated breach
4. **Analysis Report + Event Graph** — AI threat analysis with a forensic relationship graph

### Supported Log Sources (Demo)
| Source | Format | Scenario |
|---|---|---|
| Proprietary Firewall (Vendor X) | UDP Syslog | ✅ Routine HTTPS traffic — clean baseline |
| Nginx API Gateway | HTTP Access Log | ⚠️ Brute-force / credential stuffing |
| Windows AD Controller | WinEvent Log | 🚨 Data tampering — Merkle mismatch |
| Legacy Mainframe DB | Pipe-Delimited | 🔴 Financial anomaly — deviation alert |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│            DATA SOURCES                     │
│  Firewalls · Routers · Windows AD · DBs     │
└──────────────────┬──────────────────────────┘
                   │  Syslog / UDP / HTTP / Pipe
                   ▼
┌─────────────────────────────────────────────┐
│            INGESTION LAYER                  │
│              Apache Kafka                   │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│          PROCESSING LAYER                   │
│       Apache Spark Structured Streaming     │
│                                             │
│  [Drain3 AI] → [ECS Normalizer] → [Merkle] │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│            STORAGE LAYER                    │
│   Elasticsearch (hot) + Parquet/S3 (cold)   │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│         DASHBOARD & ANALYTICS               │
│    Next.js · Event Graph · Threat Reports   │
└─────────────────────────────────────────────┘
```

---

## 🛠️ Prototype Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript |
| UI Styling | Tailwind CSS (custom dark theme) |
| Backend API | FastAPI (Python) |
| Parser Engine | Custom TemplateMiner (Drain-style algorithm) |
| Custody / Integrity | Python `hashlib` — SHA-256 Merkle blocks |
| Event Store | SQLite (`logs.db`) |
| Deployment | Docker Compose |

---

## 🚀 Running Locally

### Prerequisites
- Python 3.10+
- Node.js 20+

### 1. Start the Backend API
```bash
# From project root
python api.py
# API runs at http://localhost:8000
```

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
# Dashboard at http://localhost:3000
```

### 3. Run Tests
```bash
pytest tests/
```

### Docker (Alternative)
```bash
docker-compose up --build -d
```

---

## 📁 Directory Structure

```
.
├── api.py                  # FastAPI entry point
├── onboarding/             # Drain-style template miner & schema mapper
├── custody/                # SHA-256 Merkle chain & block sealing
├── ingest/                 # Log receivers (syslog, HTTP, file)
├── parsing/                # Regex / JSONPath execution engine
├── losslessness/           # Round-trip reconstruction & scoring
├── graph/                  # Event relationship graph builders
├── frontend/               # Next.js dashboard (App Router)
│   └── app/page.tsx        # Main 4-step pipeline UI
├── tests/                  # Automated test suite
├── docker-compose.yml
└── logs.db                 # SQLite event store
```

---

## 📊 Production Stack (Scale Target)

| Layer | Technology | Purpose |
|---|---|---|
| Ingestion | Apache Kafka | Billions of events/day streaming |
| Processing | Apache Spark | Parallel parsing & normalization |
| Parser AI | Drain3 | Zero-regex self-onboarding |
| Schema | ECS (Elastic Common Schema) | Vendor-agnostic unified format |
| Integrity | SHA-256 Merkle Trees | Tamper-evident custody |
| Hot Storage | Elasticsearch | Real-time forensic search |
| Cold Storage | Apache Parquet | Immutable audit archive |
| Frontend | Next.js + D3.js | Real-time dashboard & graphs |
| Deployment | Kubernetes (Helm) | Air-gappable, horizontally scalable |

---

## 🏆 Built For

**Smart India Hackathon 2026**  
Problem Statement: Design and develop a Universal Log Pre-processing Framework (ULPF) capable of ingesting, parsing, normalizing, and standardizing logs and events generated by any hardware or software system.

---

## 📄 License

MIT
