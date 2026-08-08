import uuid
from sqlalchemy import Column, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.session import Base
from sqlalchemy import JSON

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    current_step = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False, default="HEALTHY")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    steps = relationship("WorkflowStep", back_populates="workflow", cascade="all, delete-orphan")
    diagnoses = relationship("Diagnosis", back_populates="workflow", cascade="all, delete-orphan")


class WorkflowStep(Base):
    __tablename__ = "workflow_steps"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workflow_id = Column(String, ForeignKey("workflows.id"), nullable=False)
    step_name = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False, default="PENDING")
    error_context = Column(JSON, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    workflow = relationship("Workflow", back_populates="steps")
    diagnoses = relationship("Diagnosis", back_populates="step")


class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workflow_id = Column(String, ForeignKey("workflows.id"), nullable=False)
    step_id = Column(String, ForeignKey("workflow_steps.id"), nullable=False)
    cause = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    severity = Column(String, nullable=False)
    recommended_actions = Column(JSON, nullable=False)
    requires_human_approval = Column(Boolean, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    workflow = relationship("Workflow", back_populates="diagnoses")
    step = relationship("WorkflowStep", back_populates="diagnoses")
    recovery_plan = relationship("RecoveryPlan", back_populates="diagnosis", uselist=False, cascade="all, delete-orphan")


class RecoveryPlan(Base):
    __tablename__ = "recovery_plans"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    diagnosis_id = Column(String, ForeignKey("diagnoses.id"), nullable=False, unique=True)
    actions = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    diagnosis = relationship("Diagnosis", back_populates="recovery_plan")
    history = relationship("RescueHistory", back_populates="recovery_plan", uselist=False, cascade="all, delete-orphan")


class RescueHistory(Base):
    __tablename__ = "rescue_history"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    workflow_id = Column(String, ForeignKey("workflows.id"), nullable=False)
    step_id = Column(String, ForeignKey("workflow_steps.id"), nullable=False)
    recovery_plan_id = Column(String, ForeignKey("recovery_plans.id"), nullable=False, unique=True)
    status = Column(String(50), nullable=False)
    executed_at = Column(DateTime(timezone=True), server_default=func.now())

    recovery_plan = relationship("RecoveryPlan", back_populates="history")

