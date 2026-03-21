# 🚀 Usage Metering & Billing Engine for Object Storage

A production-ready, multi-tenant cloud storage billing system built with C++, Node.js, React, and Python ML.

---

## 🏗️ Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  React Dashboard │────▶│ Node.js/Express  │────▶│    MongoDB      │
│   (Port 5173)   │     │   (Port 5000)    │     │  (Port 27017)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
           ┌──────────────┐      ┌──────────────────┐
           │  C++ Metering│      │   ML Forecasting  │
           │   Engine     │      │   Engine (Python) │
           │  (Port 8080) │      │   (Port 5001)     │
           └──────────────┘      └──────────────────┘
```

---

## ✨ Features

- **Multi-tenant Support** — Multiple customers with isolated billing
- **C++ Metering Engine** — High-performance usage tracking
- **Real-time Billing** — AWS-like pricing (storage, API calls, bandwidth)
- **ML Forecasting** — Next month usage prediction using Linear Regression
- **JWT Authentication** — Secure login/register
- **Interactive Dashboard** — Charts, bill summary, ML predictions
- **Docker Support** — One command to run everything

---

## 💰 Pricing Model

| Resource | Price |
|----------|-------|
| Storage | $0.023 per GB |
| API Calls | $0.004 per 10,000 calls |
| Bandwidth | $0.09 per GB |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + TailwindCSS + Recharts |
| Backend | Node.js + Express + JWT |
| Database | MongoDB |
| Core Engine | C++ (Crow HTTP + nlohmann-json) |
| ML Engine | Python + Flask + scikit-learn |
| DevOps | Docker + Docker Compose |

---

## 🚀 Quick Start (Docker)

### Prerequisites
- Docker Desktop

### Run
```bash
git clone https://github.com/sandeshsingh1/Billing-Meter.git
cd Billing-Meter
docker-compose up --build
```

### Access
| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| C++ Engine | http://localhost:8080 |
| ML Engine | http://localhost:5001 |

---

## 🔧 Manual Setup (Without Docker)

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB 7.0
- CMake + G++ (WSL/Linux)

### Start Order

**Terminal 1 (WSL):**
```bash
mongod --fork --logpath /var/log/mongodb.log
cd cpp-engine/build && ./billing_engine
cd ml-engine && python3 predict.py
```

**Terminal 2 (WSL):**
```bash
cd backend && npm run dev
```

**Terminal 3:**
```bash
cd frontend && npm run dev
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new tenant |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get profile |

### Usage
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/usage/record | Record usage |
| GET | /api/usage/current | Current month usage |
| GET | /api/usage/history | Usage history |

### Billing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/billing/current | Current bill |
| POST | /api/billing/generate | Generate invoice |
| GET | /api/billing/invoices | All invoices |
| GET | /api/billing/forecast | ML prediction |

### C++ Engine (Direct)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /usage | Record usage |
| GET | /usage/:tenantId | Get usage |
| GET | /bill/:tenantId | Calculate bill |

---

## 🧪 Testing

### C++ Unit Tests (7/7 passing)
```bash
cd cpp-engine/build
./run_tests
```
```
[==========] Running 7 tests from 2 test suites.
[  PASSED  ] 7 tests.
```

---

## 👤 Test Credentials
```
Email:    sandesh@test.com
Password: 123456
TenantId: t001
```

---

## 📊 Dashboard Preview

- ✅ Real-time usage stats
- ✅ Cost breakdown charts
- ✅ Bill summary
- ✅ ML next month prediction

---

## 👨‍💻 Author

**Sandesh Singh**
- GitHub: [@sandeshsingh1](https://github.com/sandeshsingh1)