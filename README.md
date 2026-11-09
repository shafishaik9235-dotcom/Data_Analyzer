# Data_Analyzer — AI-Powered Data Analytics Platform

![Data_Analyzer Architecture](https://img.shields.io/badge/Platform-Data__Analyzer-8B7BE8?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-2.2+-150458?style=for-the-badge&logo=pandas&logoColor=white)

> **Data_Analyzer** is a production-minded, portfolio-caliber full-stack data analytics and intelligence platform. It enables teams to upload CSV or Excel datasets, explore statistical distributions, audit data quality health, execute reproducible cleaning pipelines, compose rich interactive visualizations, ask natural language questions with 100% verified zero-hallucination calculations, and export executive analytical briefings.

---

## 1. Distinctive Editorial SaaS Design System

Data_Analyzer departs from generic dark-mode dashboards to deliver a refined, modern editorial SaaS aesthetic crafted with warm tones, accessible contrasts, and smooth micro-animations.

| Design Token | Hex Code | Visual Application |
| :--- | :--- | :--- |
| **Main Background** | `#F7F5F0` | Warm ivory canvas |
| **Primary Surface** | `#FFFFFF` | Elevated cards, tables, modals |
| **Secondary Surface** | `#F0EDF9` | Pale lavender highlights & badges |
| **Primary Accent** | `#8B7BE8` | Soft violet interactive controls & focus rings |
| **Primary Hover** | `#7564D5` | Deeper violet button hover states |
| **Mint Accent** | `#DDF2E7` / `#286A50` | High-quality indicator pills & positive trends |
| **Coral Accent** | `#FBE7DC` / `#A95837` | Data anomaly alerts & quality warning tags |
| **Text Primary** | `#28263A` | Deep charcoal for readable typography |
| **Text Muted** | `#777487` | Subtle descriptive and secondary labels |
| **Borders** | `#E8E4ED` | Thin, elegant container outlines |
| **Gridlines** | `#ECEAF1` | Crisp chart Cartesian axes |

### Typography
- **Headings & Metric Numbers**: `Manrope` (Weights 600, 700, 800)
- **Body & UI Controls**: `Inter` (Weights 400, 500, 600)

---

## 2. Core Feature Capabilities

### 📊 1. Overview & Dynamic Workspace KPIs
- **Live Macro Indicators**: Aggregate dataset count, total analyzed records, composite quality scores, and report tallies computed directly from stored data snapshots.
- **Smart Primary Visualizer**: Automated aggregation of primary measures with trend insights.
- **Global Context Switcher**: 1-click dataset selection in the top navigation synchronizes across the Explorer, Cleaning Workbench, Visualizer, AI Analyst, and Reports.

### 📁 2. Dataset Ingestion & Schema Profiling
- **Multi-Format Ingestion**: Drag-and-drop support for `.csv`, `.xlsx`, and `.xls` files up to 50MB.
- **Instant Statistical Profiling**: Automatically detects data types (Numeric, Categorical, Datetime, Boolean, Text), missing cell percentages, unique cardinality, and flags constant/near-empty columns.
- **Outlier Detection**: Automated calculation of statistical fences using the $1.5 \times \text{IQR}$ (Interquartile Range) boundary rule.
- **Instant Sample Loader**: 1-click provisioning of 3 real-world datasets:
  - *Global Retail Sales Performance* (E-Commerce transactions, discounts, profits)
  - *SaaS Customer Churn & LTV* (Subscription contracts, tenure, charges)
  - *Employee Talent & Compensation Audit* (HR salary bands, ratings, overtime)

### 🧹 3. Data Quality & Cleaning Workbench
- **Audit Health Score**: 0–100% composite score measuring completeness, uniqueness, validity, and consistency.
- **Interactive Cleaning Operations**:
  - *Deduplication*: Drop exact duplicates across all columns or selected subsets.
  - *Missing Value Imputation*: Impute with Mean, Median, Mode, Constant, or Forward-Fill.
  - *Outlier Remediation*: Winsorize / clip values to IQR boundaries or drop outlier rows.
  - *Column Pruning*: Safe batch removal of uninformative dimensions.
  - *Type Casting*: Convert string columns to numeric, datetime, or boolean.
  - *Conditional Filtering*: Filter rows with operators (`>`, `>=`, `<`, `<=`, `==`, `!=`, `contains`).
- **Live Preview Before Commit**: Compare row counts and data health score deltas with affected row highlights before committing.
- **Reproducible Pipeline History**: Versioned audit trail recording transformation parameters and before/after statistics.

### 📈 4. Interactive Visualization Builder
- **8 Chart Topologies**:
  - Bar Charts & Column Charts
  - Multi-line Trend Charts
  - Area Charts with soft gradients
  - Pie & Donut Charts
  - Numeric Frequency Histograms (automatic binning)
  - Scatter Plots (with rendering sample thresholds)
  - Correlation Heatmaps (Pearson coefficient matrix with pastel color shading)
- **Flexible Mapping**: Select X-Axis, Y-Axis, Aggregation (`sum`, `avg`, `median`, `min`, `max`, `count`), Sort Order, and multi-series `Group By`.
- **Export Capabilities**: Save favorite charts to dashboard or export underlying filtered data points as CSV.

### 🤖 5. Grounded Conversational AI Analyst
- **Zero Hallucination Architecture**: Natural language questions are parsed into a validated analysis plan, and calculations are computed strictly using Pandas on real rows. No arbitrary code execution or invented statistics.
- **Suggested Analytical Inquiries**: Contextual prompt chips automatically suggested from dataset columns (e.g., *"Which Category has the highest average Revenue?"*, *"Identify outliers in Salary"*).
- **Dual Engine Abstraction**:
  - **Gemini / OpenAI Integration**: Structured plan formulation when API keys are configured in backend environment variables.
  - **Deterministic Rule Engine (Built-in)**: 100% reliable, zero-latency local fallback that works completely offline with zero API keys required.
- **Explainability**: Clear separation between *Verified Quantitative Facts* (exact computed numbers) and *Analytical Interpretations*.

### 📑 6. Executive Analytical Reports
- **Executive Summaries**: High-level narrative grounded in dataset dimensions.
- **Categorized Findings**: Key drivers, statistical distributions, quality scores, and outlier alerts with severity badges.
- **Print / PDF Layout**: Clean CSS `@media print` stylesheet optimized for browser printing and PDF generation.

---

## 3. Technology Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **Language**: TypeScript 5.7+
- **Styling**: Tailwind CSS v4 with custom tokens and typography
- **Charts**: Recharts 3.x
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router DOM v7

### Backend
- **Framework**: FastAPI (Python 3.14 / 3.11+)
- **Data Engine**: Pandas 2.2+, NumPy
- **Persistence**: SQLAlchemy 2.0 ORM (SQLite default with PostgreSQL support)
- **Validation**: Pydantic v2 & Pydantic-Settings
- **Security**: JWT tokens (Python-Jose) & direct Bcrypt password hashing
- **Testing**: Pytest & FastAPI TestClient

---

## 4. Project Directory Structure

```
Data_Analyzer /
├── frontend/
│   ├── src/
│   │   ├── api/            # Typed API client and HTTP endpoints
│   │   ├── components/     # Reusable design system UI (Button, Card, Badge, Modal, etc.)
│   │   ├── context/        # Global AppContext (user, reactive dataset, toasts)
│   │   ├── features/       # Feature domain modules
│   │   │   ├── datasets/       # UploadDropzone, SampleDatasetSelector
│   │   │   ├── cleaning/       # QualityScoreCard, CleaningActionModal, History
│   │   │   ├── visualizations/ # ChartRenderer (Recharts), ChartConfigPanel
│   │   │   ├── ai-analyst/     # ChatInterface, SuggestedChips
│   │   │   └── reports/        # ReportViewer, Print stylesheet
│   │   ├── layouts/        # AppLayout, Sidebar, TopNav
│   │   ├── pages/          # Overview, Datasets, Explorer, Cleaning, Visuals, AI, Reports, Settings
│   │   ├── types/          # TypeScript interfaces
│   │   ├── index.css       # Tailwind v4 theme tokens
│   │   └── App.tsx         # Route orchestration
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── app/
│   │   ├── main.py         # FastAPI factory, lifespan, CORS, and routers
│   │   ├── core/           # Pydantic settings and security
│   │   ├── db/             # SQLAlchemy engine and session providers
│   │   ├── models/         # User, Dataset, DatasetVersion, CleaningStep, Visualization, Report
│   │   ├── schemas/        # Pydantic schemas and analysis plans
│   │   ├── api/routes/     # health, auth, datasets, cleaning, visualizations, ai, reports
│   │   ├── services/       # dataset_service (file parsing & samples), export_service
│   │   ├── analytics/      # profiler, quality auditor, cleaner transformer, aggregator
│   │   └── ai/             # provider abstraction, Gemini provider, Deterministic rule engine
│   ├── tests/              # Pytest automated test suite
│   ├── requirements.txt
│   ├── pytest.ini
│   └── .env.example
├── docker-compose.yml      # Multi-container deployment spec
├── run_dev.bat             # 1-Click Windows concurrent runner
├── run_backend.bat         # Windows backend startup
├── run_frontend.bat        # Windows frontend startup
└── README.md
```

---

## 5. Getting Started & Installation

### Option A: 1-Click Windows Local Run (Quickest)

Simply double-click `run_dev.bat` in the project root, or execute from PowerShell:
```powershell
.\run_dev.bat
```
This automatically initializes the Python virtual environment, installs backend dependencies, and opens both servers:
- **Frontend Web Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API & Swagger Docs**: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)

---

### Option B: Manual Local Setup

#### 1. Start Backend Server
```bash
cd backend

# Create and activate virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

# Install locked dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Start Frontend Server
In a separate terminal:
```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173). The application automatically signs you in as a **Demo Analyst** on first visit so you can explore all features immediately.

---

### Option C: Docker Compose (Full Stack + PostgreSQL)

```bash
docker-compose up --build
```
This spins up PostgreSQL on port `5432`, the FastAPI backend on port `8000`, and the React frontend on port `5173`.

---

## 6. Running Automated Tests

Data_Analyzer includes a complete Pytest test suite covering health checks, authentication, dataset upload, schema profiling, cleaning transformations, deterministic query parsing, and report generation:

```bash
cd backend
.venv\Scripts\python -m pytest -v
```

Expected output:
```
tests/test_api.py::test_health_endpoint PASSED                           [ 14%]
tests/test_api.py::test_demo_auth PASSED                                 [ 28%]
tests/test_api.py::test_sample_datasets_provisioning PASSED              [ 42%]
tests/test_api.py::test_dataset_upload_and_preview PASSED                [ 57%]
tests/test_api.py::test_cleaning_workbench_operations PASSED             [ 71%]
tests/test_api.py::test_deterministic_ai_engine PASSED                   [ 85%]
tests/test_api.py::test_report_generation PASSED                         [100%]
============================== 7 passed in 2.46s ==============================
```

To validate the frontend TypeScript build:
```bash
cd frontend
npm run build
```

---

## 7. API Reference Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health, database status, and active AI engine |
| `POST` | `/api/auth/demo` | 1-click login generating instant demo access token |
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/login` | Authenticate existing user |
| `GET` | `/api/datasets` | List all datasets owned by active user |
| `POST` | `/api/datasets` | Upload and profile new CSV or XLSX dataset |
| `POST` | `/api/datasets/sample` | Provision realistic demo datasets |
| `GET` | `/api/datasets/{id}/preview` | Paginated row preview with sorting and search |
| `GET` | `/api/datasets/{id}/profile` | Statistical profiling and data quality audit |
| `GET` | `/api/datasets/{id}/export` | Stream active or cleaned dataset as CSV |
| `POST` | `/api/datasets/{id}/clean/preview` | Preview row counts and quality delta without mutating |
| `POST` | `/api/datasets/{id}/clean/apply` | Apply transformation and record pipeline version |
| `GET` | `/api/datasets/{id}/clean/history` | Audit log of applied transformations |
| `POST` | `/api/datasets/{id}/visualize` | Compute chart data for 8 visualization topologies |
| `POST` | `/api/datasets/{id}/ask` | Conversational analytics query with grounded statistics |
| `GET` | `/api/datasets/{id}/suggested-questions` | Contextual question chips based on schema |
| `POST` | `/api/reports/generate` | Compile executive audit report with findings |
| `GET` | `/api/reports` | List saved analytical reports |

Interactive OpenAPI documentation is accessible at `http://localhost:8000/api/docs`.

---

## 8. Security & Data Integrity Guarantees

1. **Zero Statistical Hallucination**: LLMs are never allowed to execute arbitrary code or estimate numbers. Intent is translated into validated Pandas queries on verified columns.
2. **Path Traversal Protection**: Uploaded filenames are sanitized and isolated under UUID-based storage paths.
3. **In-Memory Row Limits**: Configurable upload limits (50MB / 500,000 rows default) prevent memory exhaustion.
4. **Data Privacy**: No dataset contents are shared across users. If no AI key is provided, analysis runs 100% locally on your machine.
5. **Reproducibility**: All data cleaning operations produce versioned snapshots, allowing non-destructive experimentation and auditable data transformations.

---

## 9. License

This project is licensed under the MIT License.
