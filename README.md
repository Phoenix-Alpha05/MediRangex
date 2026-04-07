# MediRangex — AI Clinical Intelligence Platform

Production-grade AI platform unifying predictive analytics, medication intelligence, and operational forecasting across multi-location hospital networks.

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
| **Database** | Supabase (PostgreSQL), Vector Storage |
| **Deployment** | Docker, Docker Compose |

---

## Architecture Overview

```
Frontend (React + TypeScript)
    ↓
API Gateway (FastAPI)
    ↓
┌─────────────────┬─────────────────┬──────────────────┐
│   ML Pipeline   │  RAG Pipeline   │  Data Pipeline   │
├─────────────────┼─────────────────┼──────────────────┤
│ Scikit-learn    │ LangChain       │ PostgreSQL       │
│ XGBoost         │ LlamaIndex      │ Supabase         │
│ Prophet         │ Vector DB       │ Alembic          │
└─────────────────┴─────────────────┴──────────────────┘
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose

### 1. Clone the repository
```bash
git clone https://github.com/Phoenix-Alpha05/MediRangex.git
cd MediRangex
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Run with Docker (recommended)
```bash
docker-compose up --build
```

### 4. Or run manually

**Backend:**
```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
npm install
npm run dev
```

---

## Project Structure

```
MediRangex/
├── app/              # Backend application
├── frontend/         # React frontend
├── data/knowledge/   # RAG knowledge base
├── scripts/          # Utility scripts
├── alembic/          # Database migrations
└── supabase/         # Supabase configurations
```

---

## Business Impact

- **40% reduction** in clinical research manual effort
- **Early detection** of patient deterioration events
- **Real-time visibility** across 5+ hospital branches
- **Proactive resource planning** based on predictive forecasts
- **Compliance automation** for regulatory reporting

---

## Related Projects

- [AccrediX](https://accredix.lovable.app/) — Hospital Accreditation Management Platform
- [Energy Market Intelligence AI Platform](https://energymarketintelligenceaiplatform.lovable.app/)

---

## Author

**Dr. Narendra**  
📧 [narendra.g.work@gmail.com](mailto:narendra.g.work@gmail.com)  
🔗 [linkedin.com/in/drnarendra](https://www.linkedin.com/in/drnarendra/)
