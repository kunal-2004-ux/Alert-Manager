# Intelligent Alert Escalation & Resolution System

A robust, automated backend system designed to manage, escalate, and resolve alerts in real-time, ensuring critical issues are addressed efficiently while minimizing alert fatigue.

## Overview

The **Intelligent Alert Escalation & Resolution System** is a centralized platform for handling alerts from various sources, such as driver mobile apps and vehicle sensors. It solves the problem of manual alert tracking by providing automated workflows for ingestion, deduplication, escalation, and resolution.

**Key Highlights:**
*   **Automated Ingestion**: Seamlessly handle single or batch alert submissions.
*   **Smart Rules Engine**: Configurable rules for auto-closing and escalating alerts based on metadata or time.
*   **Real-time Dashboard**: API endpoints powering a dynamic frontend for monitoring trends and top offenders.
*   **Audit Trails**: Full history tracking for every alert state change for compliance and debugging.
*   **Scalable Architecture**: Built with Node.js, TypeScript, and PostgreSQL to handle high throughput.

## Architecture & Tech Stack

The system follows a modular **Layered Architecture** (Controller-Service-Repository) to ensure separation of concerns and maintainability. Background workers handle asynchronous tasks like auto-closure to keep the API responsive.

**Core Technologies:**
*   **Runtime**: Node.js
*   **Language**: TypeScript
*   **Framework**: Express.js
*   **Database**: PostgreSQL
*   **ORM**: Prisma
*   **Authentication**: Clerk
*   **Scheduling**: node-cron
*   **Logging & Monitoring**: Winston, Prometheus

**Frontend:**
*   **Framework**: React (Vite)
*   **Styling**: CSS Modules / Vanilla CSS
*   **Charts**: Recharts

## Features

*   **Alert Management**
    *   Ingest alerts with severity levels and custom metadata.
    *   Deduplicate incoming alerts to prevent noise.
    *   Manually resolve alerts with audit logging.
*   **Automated Workflows**
    *   **Auto-Closure**: Automatically close alerts if specific conditions are met (e.g., "document_valid" becomes true) or after a set time.
    *   **Escalation**: (Planned) Escalate alerts based on severity or duration.
*   **Dashboard Analytics**
    *   **Summary Cards**: Real-time counts of Open, Escalated, and Resolved alerts.
    *   **Top Drivers**: Identify drivers with the most frequent alerts.
    *   **Trends**: Visualizing alert volume over time.
    *   **Recent Activity**: Live feed of the latest system events.
*   **Security & Reliability**
    *   Secure API endpoints using Clerk authentication.
    *   Comprehensive error handling and logging.

## Project Folder Structure

```
/
├── src/
│   ├── api/                # API Layer
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # Route definitions
│   │   └── middlewares/    # Auth and validation middlewares
│   ├── services/           # Business logic layer
│   ├── repositories/       # Database access layer
│   ├── workers/            # Background jobs (e.g., AlertProcessor)
│   ├── rules/              # Configuration for alert handling rules
│   ├── models/             # TypeScript interfaces/types
│   └── utils/              # Helper functions (Logger, etc.)
├── prisma/                 # Database schema and migrations
├── frontend/               # React frontend application
├── tests/                  # Unit and integration tests
└── package.json            # Project dependencies and scripts
```

## Setup Instructions

Follow these steps to set up the project locally.

### Prerequisites
*   Node.js (v18+)
*   PostgreSQL
*   npm or yarn

### Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd intelligent-alert-escalation-system
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory:
    ```env
    PORT=3000
    DATABASE_URL="postgresql://user:password@localhost:5432/alert_db"
    CLERK_SECRET_KEY="your_clerk_secret_key"
    CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
    ```

4.  **Database Migration:**
    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Run the Server:**
    ```bash
    npm run dev
    ```

### Frontend Setup

1.  **Navigate to frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the Frontend:**
    ```bash
    npm run dev
    ```

## API Documentation

### Alerts

*   **Create Alert**
    *   `POST /api/alerts`
    *   **Body**:
        ```json
        {
          "driverId": "driver_123",
          "sourceType": "overspeeding",
          "severity": "high",
          "metadata": { "speed": 120, "limit": 80 }
        }
        ```
*   **Batch Create**
    *   `POST /api/alerts/batch`
    *   **Body**: Array of alert objects.
*   **Resolve Alert**
    *   `PATCH /api/alerts/:id/resolve`
    *   **Body**: `{"status": "RESOLVED"}` (optional, implied)

### Dashboard (Protected)

*   **Get Summary**
    *   `GET /api/dashboard/summary`
    *   **Response**: `{ "open": 10, "resolved": 5, "escalated": 2 }`
*   **Get Top Drivers**
    *   `GET /api/dashboard/top-drivers`
*   **Get Trends**
    *   `GET /api/dashboard/trends`

## How the System Works

### 1. Alert Creation Flow
1.  Client sends `POST /api/alerts`.
2.  **Controller** validates input.
3.  **Service** checks for duplicates (same `fingerprint` within a time window).
4.  **Repository** saves the alert to PostgreSQL with status `OPEN`.

### 2. Auto-Closure Flow (Worker)
1.  `AlertProcessor` runs periodically (via `node-cron`).
2.  Fetches all `OPEN` alerts.
3.  Loads rules from `src/rules/alertRules.json`.
4.  Checks conditions:
    *   **Time-based**: Is `(now - created_at) > auto_close_after_mins`?
    *   **Condition-based**: Does `alert.metadata` satisfy `auto_close_if`?
5.  If yes, updates status to `AUTO_CLOSED` and appends to history.

### 3. Recent Activity Rendering
1.  Frontend polls (or uses Socket.io) `GET /api/dashboard/events`.
2.  Backend queries `AuditLog` table for the latest actions.
3.  Returns a list of events (e.g., "Alert #123 auto-closed", "User X resolved Alert #456").

## Demo

*(Placeholders for screenshots)*

| Dashboard Overview | Alert Drill-Down |
|:---:|:---:|
| ![Dashboard Placeholder](https://via.placeholder.com/600x300?text=Dashboard+Screenshot) | ![Drilldown Placeholder](https://via.placeholder.com/600x300?text=Alert+Details+Screenshot) |

## Future Enhancements

1.  **Webhooks Integration**: Notify external systems (Slack, PagerDuty) on high-severity alerts.
2.  **Advanced Rule Engine**: Support complex boolean logic (AND/OR) for auto-closure conditions.
3.  **Role-Based Access Control (RBAC)**: Granular permissions for Admin vs. Support staff.
4.  **AI-Powered Insights**: Anomaly detection to predict potential high-risk drivers.
5.  **Export Functionality**: Download alert reports as CSV/PDF.
6.  **Multi-Tenancy**: Support multiple organizations within the same instance.

## Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
