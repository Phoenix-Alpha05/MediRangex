# MediRangeX — AI Clinical Intelligence Platform

> Production-grade clinical decision support system combining predictive ML models, 
> NLP-powered medication intelligence, and operational forecasting across a 
> multi-location hospital network.

**Live Platform:** [medirangex.bolt.host](https://medirangex.bolt.host)

---

## What This Is

MediRangeX is a full-stack AI platform built for real clinical operations at Andhra Hospitals Group (5+ locations). It replaces manual, intuition-driven clinical workflows with ML-powered decision support — adopted by clinical and operations leadership for daily use.

This is not a demo or tutorial project. It runs in production, handles real operational data, and was built iteratively with clinical stakeholders over 2+ years.

---

## Core ML Capabilities

### Patient Risk Stratification
- Classification pipeline predicting patient deterioration risk
- Features engineered from vitals trends, lab results, medication history, and admission patterns
- Outputs risk scores consumed by clinical dashboards for proactive intervention

### ICU Capacity Forecasting
- Time-series demand forecasting for ICU and high-dependency beds
- Multi-step ahead predictions enabling proactive resource allocation
- Reduces reactive scrambling for critical care capacity

### Medication Safety Intelligence
- NLP pipeline over clinical notes and prescription data
- Flags high-risk drug combinations and dosing anomalies
- Transformer-based embeddings for clinical text understanding

### Operational Analytics
- Cross-branch KPI dashboards adopted by hospital leadership
- Model output monitoring integrated with operational metrics
- Real-time visibility across 5+ hospital locations

---

## System Architecture

```
┌─────────────────────────────────────────────────┐
│              React Frontend                     │
│      (TypeScript · Vite · Tailwind)            │
└────────────────────┬────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────┐
│          FastAPI Backend (main.py)              │
│  • Structured logging middleware                │
│  • Error handling middleware                    │
│  • Knowledge Bank loader (clinical AI context)  │
│  • Alembic DB migrations                        │
└──────┬──────────────────┬───────────────────────┘
       │                  │
┌──────▼──────┐    ┌──────▼──────────────────────┐
│  Supabase   │    │       ML / AI Layer         │
│ (Postgres)  │    │  • Scikit-learn pipelines   │
│             │    │  • Transformer embeddings   │
│             │    │  • Knowledge bank (RAG)     │
└─────────────┘    └─────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| ML & Modeling | Scikit-learn, Transformer embeddings, time-series forecasting |
| NLP | Clinical text pipelines, embedding-based similarity |
| Backend | FastAPI, Python, Alembic, SQLAlchemy |
| Frontend | TypeScript, React, Vite |
| Database | Supabase (PostgreSQL) |
| Infrastructure | Docker, docker-compose |
| Observability | Structured logging (request tracing, error middleware) |

---

## Repository Structure

```
├── main.py              # FastAPI app entry — middleware, lifespan, routing
├── app/
│   ├── api/             # Route handlers
│   ├── core/            # Config, logging, middleware
│   ├── db/              # Session management
│   ├── knowledge_bank/  # Clinical AI knowledge loader (RAG layer)
│   └── schemas/         # Pydantic models
├── alembic/             # DB migrations
├── scripts/             # Seed data, utilities
├── frontend/            # React/TS frontend
├── Dockerfile
└── docker-compose.yml
```

---

## Key Engineering Decisions

**Knowledge Bank as RAG Layer** — Clinical context (drug interactions, protocol guidelines, risk thresholds) is loaded at startup as a structured knowledge bank, enabling the API to ground AI responses in validated clinical sources rather than raw LLM outputs.

**Middleware-first observability** — Every request is logged with structured JSON (request ID, latency, endpoint, status). Errors are intercepted before reaching the client, enabling clean separation of failure modes.

**Alembic migrations** — Schema changes are versioned and reproducible, not ad-hoc. Critical for a production system where data integrity has clinical consequences.

**Docker-first deployment** — Full stack runs via `docker-compose up`, making environment parity between development and production explicit.

---

## Results (Production)

- Patient deterioration detection adopted by ICU clinical team for proactive intervention
- ICU capacity forecasting reduced reactive resource scrambling across high-dependency units  
- Medication safety NLP flagging integrated into prescription review workflow
- Operational dashboards used daily by leadership across 5+ hospital branches

---

## Local Setup

```bash
# Clone and configure
git clone https://github.com/Phoenix-Alpha05/MediRangex.git
cd MediRangex
cp .env.example .env  # add your API keys

# Run with Docker
docker-compose up --build

# API docs available at
http://localhost:8000/docs
```

---

## Author

**Narendra Ganta** — Data Scientist & AI Systems Builder  
[linkedin.com/in/drnarendra](https://www.linkedin.com/in/drnarendra/) · [medirangex.bolt.host](https://medirangex.bolt.host)
