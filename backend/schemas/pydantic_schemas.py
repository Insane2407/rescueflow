from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any
from datetime import datetime
from enum import Enum

class DiagnosisBase(BaseModel):
    cause: str
    confidence: float
    severity: str
    recommended_actions: List[str]
    requires_human_approval: bool

class DiagnosisResponse(DiagnosisBase):
    id: str
    workflow_id: str
    step_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class WorkflowStepBase(BaseModel):
    step_name: str
    status: str
    error_context: Optional[Any] = None

class WorkflowStepResponse(WorkflowStepBase):
    id: str
    workflow_id: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class WorkflowBase(BaseModel):
    name: str

class WorkflowResponse(WorkflowBase):
    id: str
    current_step: str
    status: str
    created_at: datetime
    updated_at: datetime
    steps: List[WorkflowStepResponse] = []
    active_diagnosis: Optional[DiagnosisResponse] = None

    model_config = ConfigDict(from_attributes=True)

class FailureType(str, Enum):
    MISSING_CUSTOMER_INFO = "MISSING_CUSTOMER_INFO"
    PAYMENT_FAILED = "PAYMENT_FAILED"
    INVENTORY_UNAVAILABLE = "INVENTORY_UNAVAILABLE"
    API_TIMEOUT = "API_TIMEOUT"

class SimulateFailureRequest(BaseModel):
    step_name: str
    failure_type: FailureType
    message: str

class FailureCategory(BaseModel):
    label: str
    pct: float

class AnalyticsResponse(BaseModel):
    total_workflows: int
    failed_workflows: int
    rescued_workflows: int
    recovery_success_rate: float
    average_recovery_time_seconds: float
    human_interventions: int
    failure_categories: List[FailureCategory]
    time_saved_hours: float
