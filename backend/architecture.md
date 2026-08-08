# FlowRescue Backend Architecture

## Overview
FlowRescue is an AI-powered workflow recovery and automation platform. The backend is designed to monitor digital workflows in real-time, detect failures, invoke an LLM for root-cause diagnosis, and execute an automated recovery plan.

## Technology Stack
- **Language**: Python 3.11+
- **API Framework**: FastAPI (chosen for async support and high performance)
- **Database**: PostgreSQL (hosted via Supabase)
- **ORM**: SQLAlchemy or SQLModel
- **AI/LLM Provider**: OpenAI (GPT-4o) or Anthropic (Claude 3.5 Sonnet)
- **Task Queue**: Celery with Redis (for handling async AI diagnosis without blocking the API)

## System Components

### 1. The Workflow Engine Observer
A service layer that listens to incoming webhook events from simulated external services (Order Management, Payment Gateway, Inventory System). It updates the state of the workflow in the database.

### 2. The AI Diagnostic Engine
When a workflow halts (enters a `FAILED` state), this engine is triggered. It packages the workflow context, recent state changes, and error logs, and sends them to the LLM via a strict JSON schema prompt to determine the root cause.

### 3. The Recovery Executor
Once a diagnosis is made, this module decides the sequence of actions needed to repair the workflow. 
- **Low Risk Actions**: Automatically executed (e.g., retrying an API call).
- **High Risk Actions**: Paused in a `WAITING_APPROVAL` state, notifying the frontend.

## Core Lifecycle Flow

1. **Detect**: `POST /api/v1/webhook/workflow-event` -> Updates DB. If failure is detected, transition to `FAILED`.
2. **Diagnose**: Trigger async Celery task. LLM analyzes the failure context.
3. **Decide**: LLM generates a recovery sequence (e.g., `["Request", "Validate", "Retry", "Resume"]`).
4. **Recover**: The Recovery Executor iterates through the recovery steps.
5. **Resume**: Workflow transitions back to `HEALTHY` and proceeds to the next stage.

## Frontend Communication Strategy
The frontend (React/Vite) communicates with the backend to provide a "live control room" experience:
- **Polling / Realtime**: The frontend utilizes React Query to poll the `/api/v1/workflows/{id}` endpoint. (Alternatively, Supabase Realtime WebSockets can push state changes directly to the client).
- **Intervention**: When a user clicks "Rescue Workflow", the frontend hits `POST /api/v1/workflows/{id}/rescue`, which kicks off the Diagnosis and Recovery pipeline. The UI subsequently polls for the updated diagnosis and recovery steps.
