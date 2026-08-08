export const API_URL = import.meta.env["VITE_API_URL"] || (import.meta.env.PROD ? "/api" : "http://127.0.0.1:8000/api");

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_name: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "WAITING";
  error_context: any;
  started_at: string | null;
  completed_at: string | null;
}

export interface Workflow {
  id: string;
  name: string;
  current_step: string;
  status: "HEALTHY" | "FAILED" | "PAUSED" | "COMPLETED";
  created_at: string;
  updated_at: string;
  steps: WorkflowStep[];
}

export async function fetchWorkflows(): Promise<Workflow[]> {
  const res = await fetch(`${API_URL}/workflows`);
  if (!res.ok) throw new Error("Failed to fetch workflows");
  return res.json();
}

export async function fetchWorkflow(id: string): Promise<Workflow> {
  const res = await fetch(`${API_URL}/workflows/${id}`);
  if (!res.ok) throw new Error("Failed to fetch workflow");
  return res.json();
}

export async function createWorkflow(name: string = "Demo Workflow"): Promise<Workflow> {
  const res = await fetch(`${API_URL}/workflows`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to create workflow");
  return res.json();
}

export async function fetchIncidents(): Promise<WorkflowStep[]> {
  const res = await fetch(`${API_URL}/incidents`);
  if (!res.ok) throw new Error("Failed to fetch incidents");
  return res.json();
}

export async function simulateFailure(workflowId: string, payload: { step_name: string, failure_type: string, message: string }) {
  const res = await fetch(`${API_URL}/workflows/${workflowId}/simulate-failure`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to simulate failure");
  return res.json();
}

export function executeRescue(
  workflowId: string,
  onMessage: (msg: string) => void,
  onComplete: () => void,
  onError: (err: Error) => void
) {
  const source = new EventSource(`${API_URL}/workflows/${workflowId}/rescue`);
  
  source.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.done) {
        source.close();
        onComplete();
      } else if (data.message) {
        onMessage(data.message);
      }
    } catch (e) {
      console.error("Error parsing SSE data", e);
    }
  };

  source.onerror = (err) => {
    source.close();
    onError(new Error("SSE connection error"));
  };
  
  return () => source.close();
}

export interface AnalyticsResponse {
  total_workflows: number;
  failed_workflows: number;
  rescued_workflows: number;
  recovery_success_rate: number;
  average_recovery_time_seconds: number;
  human_interventions: number;
  failure_categories: { label: string; pct: number }[];
  time_saved_hours: number;
}

export async function fetchAnalytics(): Promise<AnalyticsResponse> {
  const res = await fetch(`${API_URL}/analytics`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}
