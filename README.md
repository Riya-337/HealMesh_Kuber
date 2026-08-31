# HealMesh

> **Kubernetes failure detection, LLM-powered root-cause diagnosis, and human-approved autonomous remediation.**

HealMesh connects AI-driven observability, safety constraints, and automated execution into a self-healing Kubernetes infrastructure cockpit. It detects canonical failure modes, leverages Google Gemini to diagnose them in plain English, logs append-only audit trials, and executes remediation actions (such as `SCALE`, `PATCH`, `REDEPLOY`, and `HELM_UPGRADE`) — only with explicit human operator approval.

---

## 🌌 Interactive 3D Spatial Cockpit

HealMesh comes equipped with a custom Three.js WebGL visualizer to view your Kubernetes cluster topology:

```
[Overview] -> Live 3D cluster cockpit showing namespaces, nodes, pods, and latency links.
[Incidents] -> Real-time triage stream with Gemini diagnosis and AI confidence ratings.
[Remediation] -> Approvals panel to inspect, approve, or reject proposed actions.
[Audit Logs] -> Append-only, immutable PostgreSQL history of all incidents and actions.
[Chaos Lab] -> Interactive stress-testing simulator to inject pod/node anomalies.
```

---

## 📐 Unified System Architecture

```
                 Kubernetes Cluster (kubectl / Watch API)
                              │
                              ▼
            ┌───────────────────────────────────┐
            │       healmesh-k8s (Go)           │
            │  ├── Watcher (Read-Only Events)   │
            │  └── Executor (Write-Path Pods)   │
            └─────────────────┬─────────────────┘
                              │ Internal HTTPs / TLS
                              ▼
            ┌───────────────────────────────────┐
            │       healmesh-core (Python)      │
            │  ├── Schema Validator (Pydantic)  │
            │  ├── Prompt Engine (Gemini API)   │
            │  ├── Remediation Parser (Enums)   │
            │  ├── Audit Log (Postgres / SQL)   │
            │  └── Notifier (Slack Hook API)    │
            └─────────────────┬─────────────────┘
                              │
             ┌────────────────┴────────────────┐
             ▼                                 ▼
   Slack Diagnosis Alerts              React 19 & Three.js UI
(Root cause & command suggestion)     (3D Cluster visualizer cockpit)
```

---

## 📁 Repository Structure

The project code is modularly structured into clear directories:

| Directory | Language / Tech | Purpose |
| :--- | :--- | :--- |
| [`healmesh-core/`](./healmesh-core/) | Python 3.11 / FastAPI | Core validation, Gemini LLM diagnosis generator, append-only logger, and Slack hooks. |
| [`healmesh-k8s/`](./healmesh-k8s/) | Go 1.22 / client-go | Read-only Kubernetes Event Watcher and write-path Action Executor. |
| [`healmesh-ui/`](./healmesh-ui/) | React 19 / TanStack / Three.js | Unified client-side dashboard, 3D command cockpit, and Chaos Engineering console. |
| [`healmesh-sdk/`](./healmesh-sdk/) | Python / REST | Python SDK client to programmatically interact with validation and audit APIs. |
| [`infra/`](./infra/) | Helm / K8s / Postgres / SQL | Deployment configurations, SQL migrations, webhook configurations, and testing scripts. |
| [`docs/`](./docs/) | Markdown / PDF | Project architecture logs, testing protocols, PRD, and design sheets. |

---

## 🛡️ Non-Negotiable Safety Invariants

1. **Closed-Enum Remediation Parser:** The core parser resolves Gemini recommendations to exactly: `PATCH | REDEPLOY | SCALE | HELM_UPGRADE | NONE`. Unparseable outputs default to `NONE`. No LLM text is ever passed directly to a shell or kubectl.
2. **Separated Read & Write Paths:** `watcher/` (read) and `executor/` (write) are compiled into separate Go binaries with separate Kubernetes service accounts and RBAC bindings.
3. **Hardcoded Denylist:** Executor strictly blocks any actions targeting the `kube-system`, `kube-public`, or `healmesh` namespaces inside Go code.
4. **Append-Only Auditing:** Audit records logged to Postgres are strictly append-only (no update or delete queries).
5. **Universal Human Gate:** Every action (`SCALE`, `PATCH`, `REDEPLOY`) requires explicit manual human approval prior to execution.

---

## 🚀 Quick Start (Local Development)

### 1. Set Up Environment
Copy the example configuration:
```bash
cp .env.example .env
# Edit .env with your GEMINI_API_KEY, Slack Webhooks, and DB credentials
```

### 2. Start PostgreSQL Database
```bash
docker run -d --name healmesh-postgres \
  -e POSTGRES_DB=healmesh \
  -e POSTGRES_USER=healmesh \
  -e POSTGRES_PASSWORD=yourpass \
  -p 5432:5432 \
  postgres:15
```
Apply SQL migrations:
```bash
psql -h localhost -U healmesh -d healmesh -f infra/postgres/001_init.sql
psql -h localhost -U healmesh -d healmesh -f infra/postgres/002_api_tokens.sql
```

### 3. Run the Python Core API Backend
```bash
cd healmesh-core
pip install -r requirements.txt
uvicorn main:app --host 0.0.5.0 --port 8000 --reload
```

### 4. Run the Go Event Watcher
```bash
cd healmesh-k8s
go run ./cmd/watcher
```

### 5. Launch the React 3D Dashboard UI
```bash
cd healmesh-ui
npm install --legacy-peer-deps
npm run dev
# The dashboard runs at http://localhost:8081
```

---

## 📊 Presentation Showcase Deployments

For demonstration and client presentations, you can deploy HealMesh using two easy options:

### Option A: Static Frontend Deploy (Vercel)
The React 19 visualizer UI is fully static-bundle compatible:
1. Build the production build locally: `cd healmesh-ui && npm run build`
2. Push your code to GitHub.
3. Import the `healmesh-ui` folder into **Vercel** or **Netlify** for free static hosting with zero server setup.

### Option B: Streamlit Showcase App
We have built a Python Streamlit app that acts as an interactive simulation dashboard showing the exact SRE event log and approval workflows:
```bash
pip install streamlit
streamlit run infra/scripts/presentation_app.py
```

---

## 🧪 Testing and Simulation

To run automated unit tests:
```bash
# Python Backend Tests
cd healmesh-core && pytest tests/ -v

# Go Watcher/Executor Tests
cd healmesh-k8s && go test ./...
```

To simulate a Kubernetes CrashLoopBackOff incident and test the pipeline:
```bash
bash infra/scripts/inject_failure.sh CrashLoopBackOff
```
This triggers an event that is caught by the Go Watcher, validated by Python Core, resolved by Gemini, posted to Slack, and displayed on the 3D Cockpit awaiting your approval!

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
