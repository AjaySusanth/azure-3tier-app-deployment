# Azure 3-Tier Application Deployment

This project demonstrates a **production-style 3-tier web application deployment on Microsoft Azure**, built with modern backend, frontend, containerization, and CI/CD practices.

The focus of this project is **infrastructure, deployment, and operational correctness**, not just application code.

---

## 🧱 Architecture Overview

**Tech Stack**

* **Frontend**: React (built with Vite)
* **Reverse Proxy**: NGINX
* **Backend**: NestJS
* **Database**: PostgreSQL (Azure Flexible Server)
* **ORM**: Prisma
* **Containerization**: Docker
* **Cloud Platform**: Azure Container Apps
* **Registry**: Azure Container Registry (ACR)
* **CI/CD**: GitHub Actions

---

## 🏗️ High-Level Architecture

```
Browser
   |
   v
NGINX (Azure Container App - Public)
   |
   |  /api/*
   v
Backend API (Azure Container App - Internal)
   |
   v
Azure PostgreSQL Flexible Server
```

### Key Design Decisions

* Backend is **internal-only** (no public ingress)
* NGINX acts as:

  * Static frontend server
  * Reverse proxy for backend APIs
* Database is managed by Azure (not containerized in production)
* All services are deployed as **immutable revisions**

---

## 📁 Repository Structure

```
.
├── backend/                # NestJS backend + Prisma
├── frontend/               # React frontend (Vite)
├── nginx/                  # NGINX Dockerfile & config
├── .github/workflows/      # CI/CD pipelines
├── docker-compose.yml      # Local development
└── README.md
```

---

## 🚀 Deployment Model (Azure)

### Azure Resources Used

* **Azure Container Apps**

  * `nginx-frontend` (public)
  * `backend` (internal)
* **Azure Container Registry**
* **Azure PostgreSQL Flexible Server**

### Why Azure Container Apps?

* Revision-based deployments (safe rollouts)
* Built-in ingress
* Auto-scaling
* Lower operational overhead than AKS
* Ideal for learning production patterns without Kubernetes complexity

---

## 🔁 Request Flow (Runtime)

1. User opens the frontend URL
2. NGINX serves the React app
3. Frontend calls `/api/*`
4. NGINX proxies `/api` to the internal backend
5. Backend processes request
6. Backend queries PostgreSQL via Prisma
7. Response flows back through NGINX to the client

---

## ❤️ Health & Readiness

The backend exposes:

* `GET /health` → Liveness
* `GET /ready` → Readiness

These are used by Azure Container Apps to:

* Determine container health
* Safely manage revisions
* Avoid routing traffic to unhealthy instances

---

## 📈 Autoscaling (Azure Container Apps – KEDA)

This project includes **production-style autoscaling**, implemented and **validated under real load**, not just configured.

Autoscaling is powered by **Azure Container Apps’ built-in KEDA integration**, using **HTTP concurrency–based scaling**.

---

### Autoscaling Strategy

Autoscaling was intentionally configured **differently for each tier**, based on real-world behavior:

| Component      | Min Replicas | Max Replicas | Scaling Trigger       | Reasoning                                |
| -------------- | ------------ | ------------ | --------------------- | ---------------------------------------- |
| Backend API    | 0            | 3            | HTTP concurrency (20) | Cost-efficient, internal-only, stateless |
| NGINX Frontend | 1            | 3            | HTTP concurrency (50) | Avoid user-facing cold starts            |

---

### Why HTTP Concurrency (Not CPU)

Instead of CPU-based scaling, the system scales on **concurrent in-flight HTTP requests**.

This provides:

* Faster reaction to real traffic
* Better alignment with API pressure
* Avoidance of over-scaling on short CPU spikes

Autoscaling reacts only to **sustained load**, not request bursts.

---

### Scale-to-Zero (Backend)

The backend API is configured with:

```text
minReplicas = 0
```

This enables:

* Automatic shutdown when idle
* Zero compute cost during inactivity
* Cold-start behavior on first request

Cold starts were **observed and accepted intentionally**, as the backend is internal and fronted by NGINX.

---

### Autoscaling Validation (Learning Process)

Autoscaling behavior was **tested and observed step-by-step**:

1. **Idle State**

   * Backend scaled down to `0` replicas after cooldown
2. **Cold Start**

   * First `/api` request triggered backend scale-up
3. **Burst Traffic**

   * Short-lived request bursts did **not** trigger scaling
4. **Sustained Load**

   * Sustained concurrent requests caused backend to scale to `2` replicas
5. **Scale Down**

   * After traffic stopped, backend automatically returned to `0` replicas

This demonstrated an important production insight:

> Autoscaling responds to **sustained concurrency**, not request count or short bursts.

---

### Observed Behavior (Key Learnings)

* Fast endpoints may not trigger scaling unless load is sustained
* Autoscaling decisions are evaluated over polling intervals
* Azure avoids scale thrashing by design
* Frontend and backend scale **independently**
* Failed or unhealthy revisions never receive traffic

---

### Why This Matters

This autoscaling setup ensures:

* Cost-efficient idle behavior
* Automatic recovery under load
* No manual scaling intervention
* Safe production rollouts

The system behaves predictably under real traffic conditions, not just synthetic tests.

---


## 📊 Observability & Logging

### Structured Logging

* Backend logs are structured (JSON)
* Logs are collected via **Azure Log Analytics**

### Request ID Propagation

* NGINX generates a request ID
* Request ID is forwarded to the backend
* All logs for a request can be correlated end-to-end

This enables **trace-like debugging without distributed tracing overhead**.

---

## 🔐 Configuration & Secrets

* No secrets are hardcoded in source code
* Database connection string is injected at runtime
* Azure Container Apps manages secrets securely

---

## 🧪 Local Development

### Run Locally with Docker Compose

```bash
docker-compose up --build
```

Notes:

* Frontend, backend, and database can run locally
* PostgreSQL runs via Docker locally
* To switch between local DB and Azure DB, the database URL in `docker-compose.yml` can be adjusted (comment/uncomment)

---

## 🔄 CI/CD Pipeline (GitHub Actions)

### Pipeline Design

There are **two independent workflows**:

#### 1️⃣ Backend Deployment

Triggered when:

* `backend/**` changes
* Backend workflow file changes

Steps:

* Build backend Docker image
* Tag with `github.sha`
* Push to ACR
* Deploy new revision to Azure Container App

#### 2️⃣ Frontend / NGINX Deployment

Triggered when:

* `frontend/**` changes
* `nginx/**` changes
* Frontend workflow file changes

Steps:

* Build NGINX image (includes frontend build)
* Tag with `github.sha`
* Push to ACR
* Deploy new revision to Azure Container App

### Why This Matters

* No unnecessary rebuilds
* Frontend changes don’t redeploy backend
* Backend changes don’t redeploy frontend
* Cleaner revision history
* Lower cloud costs

---

## 🧠 Production-Grade Concepts Demonstrated

* Immutable infrastructure
* Revision-based deployments
* Zero-downtime rollouts
* Reverse proxy architecture
* Internal service networking
* Path-based CI/CD triggering
* Cost-aware cloud usage
* Operational observability
* Safe failure handling (failed revisions don’t affect users)

---

## 💰 Cost Awareness

To save Azure credits when not actively testing:

* Container Apps can be scaled to **0 replicas**
* PostgreSQL Flexible Server can be **stopped and started on demand**

This project was designed with **student / learning budgets** in mind.

---

## 📌 Status

✅ Fully deployed
✅ CI/CD automated
✅ Local and cloud environments working
✅ Production patterns applied

---

## 🧑‍💻 Author

Built as a **learning-focused production deployment project** to understand real-world cloud infrastructure, not just application code.
