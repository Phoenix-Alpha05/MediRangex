# MediRangex

# MediRangex — AI Clinical Intelligence Platform

> **Production-grade AI platform unifying predictive analytics, medication intelligence, and operational forecasting across multi-location hospital networks.**

🔗 **Live Demo:** [medirangex.bolt.host](https://medirangex.bolt.host)

---

## What is MediRangex?

MediRangex is an end-to-end AI Clinical Intelligence Platform built for multi-specialty hospital networks. It transforms raw clinical and operational data into real-time decision intelligence — enabling clinicians and hospital leadership to act proactively rather than reactively.

Built and deployed across **5+ hospital branches** at Andhra Hospitals Group, MediRangex is used daily by clinical and operations leadership for resource planning, patient safety, and compliance decisions.

---

## Key Features

### 🏥 Clinical Intelligence
- **Patient Deterioration Detection** — Early warning models flagging at-risk patients before critical events, reducing clinical response times
- **ICU Capacity Forecasting** — Predictive occupancy models enabling proactive bed and staff allocation
- **Medication Safety Intelligence** — Automated drug interaction screening and dosage anomaly detection

### 📊 Operational Analytics
- **Multi-branch Dashboards** — Unified operational visibility across 5+ hospital locations
- **Resource & Performance Forecasting** — Demand prediction for staffing, equipment, and supplies
- **Compliance Monitoring** — Real-time tracking of regulatory and accreditation KPIs

### 🤖 AI & Automation
- **LLM-powered Clinical Research** — RAG-based automation reducing manual research effort by 40%
- **ML Forecasting Pipelines** — Gradient Boosting and time-series models integrated into clinical workflows
- **Automated Reporting** — Scheduled intelligence reports pushed to leadership dashboards

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | TypeScript, React, Vite |
| **Backend** | Python, FastAPI |
| **AI / ML** | LangChain, LlamaIndex, RAG, Gradient Boosting, Scikit-learn |
| **Database** | Supabase (PostgreSQL) |
| **Migrations** | Alembic |
| **Infra** | Docker, Docker Compose |
| **Auth** | Supabase Auth with RBAC |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React/TS)                │
│        Clinical Dashboards · Analytics UI            │
└────────────────────┬────────────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────────────┐
│               Backend (FastAPI / Python)             │
│   ML Pipelines · LLM Orchestration · RAG Engine      │
└──────┬──────────────────────────┬───────────────────┘
       │                          │
┌──────▼──────┐         ┌─────────▼──────────┐
│  Supabase   │         │   AI / ML Models    │
│ (PostgreSQL)│         │ LangChain·LlamaIndex│
│    + Auth   │         │ Gradient Boosting   │
└─────────────┘         └────────────────────┘
```

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker & Docker Compose
- Supabase account (for managed DB + auth)

### 1. Clone the repository
```bash
git clone https://github.com/Phoenix-Alpha05/MediRangex.git
cd MediRangex
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Fill in your Supabase URL, Supabase anon key, and OpenAI/LLM API key
```

### 3. Run with Docker (recommended)
```bash
docker-compose up --build
```

### 4. Or run manually

**Backend:**
```bash
pip install -r requirements.txt
alembic upgrade head
python main.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Project Structure

```
MediRangex/
├── app/                  # FastAPI backend — routes, services, ML models
├── frontend/             # React + TypeScript UI
├── scripts/              # Data ingestion and automation scripts
├── alembic/              # Database migration files
├── supabase/             # Supabase config and edge functions
├── data/knowledge/       # RAG knowledge base documents
├── main.py               # Application entry point
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
```

---

## Business Impact

| Metric | Result |
|---|---|
| Manual research effort | ↓ 40% via LLM-RAG automation |
| Clinical response time | Reduced via early deterioration detection |
| Hospital branches covered | 5+ locations |
| Stakeholders | Clinical staff + Operations + Leadership |
| Deployment status | Production — daily active use |

---

## Related Projects

- **[AccrediX](https://accredix.lovable.app)** — NABH Hospital Accreditation Digital Twin Platform (639 Objective Elements, multi-tenant RBAC, stochastic anti-gaming audit engine)
- **[Energy Market Intelligence AI Platform](https://energymarketintelligenceaiplatform.lovable.app)** — Gradient Boosting + LLM research intelligence for European gas markets

---

## Author

**Narendra Ganta**
AI Product Manager | Applied AI & Decision Intelligence Systems

📧 narendra.g.work@gmail.com
🔗 [linkedin.com/in/drnarendra](https://www.linkedin.com/in/drnarendra/)

---

*Built with Python · TypeScript · LangChain · Supabase · Docker*
