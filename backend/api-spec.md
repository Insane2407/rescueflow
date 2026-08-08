# FlowRescue API Specification

This document details the RESTful API endpoints exposed by the FastAPI backend to interface with the React frontend and external services.

## Base URL
`/api/v1`

---

## 1. Workflows

### 1.1 List Workflows
- **Endpoint**: `GET /workflows`
- **Description**: Retrieves a paginated list of all monitored workflows.
- **Query Parameters**:
  - `status` (optional): Filter by `HEALTHY`, `FAILED`, `RECOVERING`.
- **Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Order #1024",
      "current_step": "INVOICE",
      "status": "FAILED",
      "updated_at": "2026-08-08T12:00:00Z"
    }
  ]
}
```

### 1.2 Get Workflow Details
- **Endpoint**: `GET /workflows/{workflow_id}`
- **Description**: Retrieves the full state of a workflow, including all steps and any active diagnosis.
- **Response**:
```json
{
  "id": "uuid",
  "name": "Order #1024",
  "status": "FAILED",
  "steps": [
    { "name": "ORDER", "status": "COMPLETED" },
    { "name": "PAYMENT", "status": "COMPLETED" },
    { "name": "INVENTORY", "status": "COMPLETED" },
    { "name": "INVOICE", "status": "FAILED" },
    { "name": "SHIPPING", "status": "PENDING" }
  ],
  "active_diagnosis": null
}
```

### 1.3 Simulate Workflow Failure (Hackathon Only)
- **Endpoint**: `POST /workflows/{workflow_id}/simulate-failure`
- **Description**: Forcibly triggers a failure on a specific step to demonstrate the rescue capability.
- **Request Body**:
```json
{
  "step_name": "INVOICE",
  "failure_type": "MISSING_INFO",
  "message": "Customer GST information not found in payload."
}
```

---

## 2. AI Diagnostics & Rescue

### 2.1 Trigger AI Diagnosis
- **Endpoint**: `POST /workflows/{workflow_id}/diagnose`
- **Description**: Initiates the AI diagnostic engine to analyze the failed workflow.
- **Response**: `202 Accepted` (Task started asynchronously)
- *Note*: The frontend will poll `GET /workflows/{workflow_id}` to retrieve the completed diagnosis.
- **Diagnosis Payload (embedded in Workflow response)**:
```json
{
  "active_diagnosis": {
    "llm_analysis": "Invoice generation failed because customer GST information is missing.",
    "confidence_score": 0.94,
    "recommended_action": ["Request", "Validate", "Retry", "Resume"]
  }
}
```

### 2.2 Execute Rescue Plan
- **Endpoint**: `POST /workflows/{workflow_id}/rescue`
- **Description**: Approves and executes the recommended AI recovery plan.
- **Response**:
```json
{
  "status": "RECOVERING",
  "message": "Recovery sequence initiated."
}
```

---

## 3. Webhooks (External System Integration)

### 3.1 Receive Workflow Event
- **Endpoint**: `POST /webhook/workflow-event`
- **Description**: Endpoint used by external systems (e.g., Stripe, Shopify) to push status updates to the FlowRescue engine.
- **Request Body**:
```json
{
  "workflow_id": "uuid",
  "step": "PAYMENT",
  "status": "COMPLETED",
  "metadata": {}
}
```
