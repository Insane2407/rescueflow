from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import StreamingResponse
import asyncio
import json
from sqlalchemy.orm import Session
from typing import List
from models import domain
from schemas import pydantic_schemas as schemas
from database.session import get_db, SessionLocal
from workflow.engine import execute_workflow_task, WORKFLOW_SEQUENCE
from services.ai_service import generate_diagnosis

def run_diagnosis_task(workflow_id: str, step_id: str):
    db = SessionLocal()
    try:
        workflow = db.query(domain.Workflow).filter(domain.Workflow.id == workflow_id).first()
        step = db.query(domain.WorkflowStep).filter(domain.WorkflowStep.id == step_id).first()
        
        if not workflow or not step:
            return
        
        context = {
            "workflow_name": workflow.name,
            "workflow_status": workflow.status,
            "failed_step": step.step_name,
            "error_type": step.error_context.get("failure_type") if step.error_context else "Unknown",
            "error_message": step.error_context.get("message") if step.error_context else "Unknown",
            "previous_attempts": 0
        }
        
        diagnosis_data = generate_diagnosis(context)
        
        diagnosis = domain.Diagnosis(
            workflow_id=workflow_id,
            step_id=step_id,
            cause=diagnosis_data["cause"],
            confidence=diagnosis_data["confidence"],
            severity=diagnosis_data["severity"],
            recommended_actions=diagnosis_data["recommended_actions"],
            requires_human_approval=diagnosis_data["requires_human_approval"]
        )
        db.add(diagnosis)
        db.commit()
        db.refresh(diagnosis)

        recovery_plan = domain.RecoveryPlan(
            diagnosis_id=diagnosis.id,
            actions=diagnosis_data["recommended_actions"]
        )
        db.add(recovery_plan)
        db.commit()
    except Exception as e:
        print(f"Error in diagnosis task: {e}")
    finally:
        db.close()

router = APIRouter(prefix="/api")

@router.post("/workflows", response_model=schemas.WorkflowResponse)
def create_workflow(workflow: schemas.WorkflowBase, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    db_workflow = domain.Workflow(name=workflow.name, current_step="ORDER")
    db.add(db_workflow)
    db.commit()
    db.refresh(db_workflow)

    # Initialize standard steps
    steps = ["ORDER", "PAYMENT", "INVENTORY", "INVOICE", "SHIPPING"]
    for step_name in steps:
        db_step = domain.WorkflowStep(
            workflow_id=db_workflow.id,
            step_name=step_name,
            status="PENDING"
        )
        db.add(db_step)
    
    db.commit()
    db.refresh(db_workflow)
    
    # Trigger background execution engine
    background_tasks.add_task(execute_workflow_task, db_workflow.id)
    
    return db_workflow

@router.get("/workflows", response_model=List[schemas.WorkflowResponse])
def get_workflows(db: Session = Depends(get_db)):
    workflows = db.query(domain.Workflow).all()
    return workflows

@router.get("/workflows/{workflow_id}", response_model=schemas.WorkflowResponse)
def get_workflow(workflow_id: str, db: Session = Depends(get_db)):
    workflow = db.query(domain.Workflow).filter(domain.Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Attach the most recent diagnosis if it exists
    diagnosis = db.query(domain.Diagnosis).filter(domain.Diagnosis.workflow_id == workflow_id).order_by(domain.Diagnosis.created_at.desc()).first()
    if diagnosis:
        workflow.active_diagnosis = diagnosis
    return workflow

@router.post("/workflows/{workflow_id}/simulate-failure")
def simulate_failure(
    workflow_id: str, 
    req: schemas.SimulateFailureRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    workflow = db.query(domain.Workflow).filter(domain.Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    step = db.query(domain.WorkflowStep).filter(
        domain.WorkflowStep.workflow_id == workflow_id,
        domain.WorkflowStep.step_name == req.step_name
    ).first()

    if not step:
        raise HTTPException(status_code=404, detail="Step not found in workflow")

    # Update workflow state
    workflow.status = "FAILED"
    workflow.current_step = req.step_name
    
    # Update step state
    step.status = "FAILED"
    step.error_context = {
        "failure_type": req.failure_type,
        "message": req.message
    }

    # Mark remaining steps as WAITING immediately for frontend responsiveness
    try:
        failed_idx = WORKFLOW_SEQUENCE.index(req.step_name)
        remaining_steps = WORKFLOW_SEQUENCE[failed_idx + 1:]
        for r_step_name in remaining_steps:
            r_step = db.query(domain.WorkflowStep).filter(
                domain.WorkflowStep.workflow_id == workflow_id,
                domain.WorkflowStep.step_name == r_step_name
            ).first()
            if r_step and r_step.status == "PENDING":
                r_step.status = "WAITING"
    except ValueError:
        pass

    db.commit()
    
    # Trigger AI diagnosis in background
    background_tasks.add_task(run_diagnosis_task, workflow_id, step.id)
    
    return {"message": f"Successfully simulated failure on {req.step_name}"}

@router.get("/incidents")
def get_incidents(db: Session = Depends(get_db)):
    failed_steps = db.query(domain.WorkflowStep).filter(domain.WorkflowStep.status == "FAILED").all()
    return failed_steps

@router.get("/incidents/{incident_id}")
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(domain.WorkflowStep).filter(domain.WorkflowStep.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.get("/workflows/{workflow_id}/rescue")
async def rescue_workflow(workflow_id: str, db: Session = Depends(get_db)):
    workflow = db.query(domain.Workflow).filter(domain.Workflow.id == workflow_id).first()
    if not workflow or workflow.status != "FAILED":
        raise HTTPException(status_code=400, detail="Workflow not in FAILED state")
        
    failed_step = db.query(domain.WorkflowStep).filter(
        domain.WorkflowStep.workflow_id == workflow_id,
        domain.WorkflowStep.step_name == workflow.current_step
    ).first()

    if not failed_step:
         raise HTTPException(status_code=404, detail="Failed step not found")

    async def event_generator():
        try:
            yield f"data: {json.dumps({'message': 'Detecting failure...'})}\n\n"
            await asyncio.sleep(1)
            
            yield f"data: {json.dumps({'message': 'Analyzing cause...'})}\n\n"
            diagnosis = db.query(domain.Diagnosis).filter(domain.Diagnosis.workflow_id == workflow_id).order_by(domain.Diagnosis.created_at.desc()).first()
            recovery_plan = db.query(domain.RecoveryPlan).filter(domain.RecoveryPlan.diagnosis_id == diagnosis.id).first() if diagnosis else None
            await asyncio.sleep(1)
            
            yield f"data: {json.dumps({'message': 'Generating recovery plan...'})}\n\n"
            await asyncio.sleep(1)
            
            actions = recovery_plan.actions if recovery_plan else []
            if not actions:
                yield f"data: {json.dumps({'message': 'Requesting information...'})}\n\n"
                await asyncio.sleep(1)

            for action in actions:
                # Replace underscores with spaces and title case for UI
                action_formatted = action.replace('_', ' ').title()
                yield f"data: {json.dumps({'message': f'{action_formatted}...'})}\n\n"
                await asyncio.sleep(1)
                
            yield f"data: {json.dumps({'message': 'Validating...'})}\n\n"
            await asyncio.sleep(1)
            
            yield f"data: {json.dumps({'message': 'Retrying failed step...'})}\n\n"
            failed_step.status = "COMPLETED"
            db.commit()
            await asyncio.sleep(1)
            
            yield f"data: {json.dumps({'message': 'Resuming workflow...'})}\n\n"
            try:
                failed_idx = WORKFLOW_SEQUENCE.index(failed_step.step_name)
                remaining_steps = WORKFLOW_SEQUENCE[failed_idx + 1:]
                for r_step_name in remaining_steps:
                    r_step = db.query(domain.WorkflowStep).filter(
                        domain.WorkflowStep.workflow_id == workflow_id,
                        domain.WorkflowStep.step_name == r_step_name
                    ).first()
                    if r_step and r_step.status == "WAITING":
                        r_step.status = "PENDING"
            except ValueError:
                pass
                
            workflow.status = "HEALTHY"
            
            if recovery_plan:
                rescue_history = domain.RescueHistory(
                    workflow_id=workflow_id,
                    step_id=failed_step.id,
                    recovery_plan_id=recovery_plan.id,
                    status="SUCCESS"
                )
                db.add(rescue_history)
                
            db.commit()
            
            # Restart engine in background
            asyncio.create_task(execute_workflow_task(workflow_id))
            
            yield f"data: {json.dumps({'message': 'Completed', 'done': True})}\n\n"
        except asyncio.CancelledError:
            print(f"Client disconnected from rescue stream for {workflow_id}")

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.get("/analytics", response_model=schemas.AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    total_workflows = db.query(domain.Workflow).count()
    failed_workflows = db.query(domain.Workflow).filter(domain.Workflow.status == "FAILED").count()
    rescued_workflows = db.query(domain.RescueHistory).filter(domain.RescueHistory.status == "SUCCESS").count()
    
    total_incidents = failed_workflows + rescued_workflows
    recovery_success_rate = (rescued_workflows / total_incidents * 100) if total_incidents > 0 else 100.0
    
    histories = db.query(domain.RescueHistory).join(domain.RecoveryPlan).join(domain.Diagnosis).all()
    total_time = sum(
        (h.executed_at - h.recovery_plan.diagnosis.created_at).total_seconds() 
        for h in histories 
        if h.executed_at and h.recovery_plan.diagnosis.created_at
    )
    avg_recovery_time = (total_time / len(histories)) if histories else 0.0
    
    human_interventions = db.query(domain.Diagnosis).filter(domain.Diagnosis.requires_human_approval == True).count()
    
    failed_steps = db.query(domain.WorkflowStep).filter(domain.WorkflowStep.status == "FAILED").all()
    counts = {}
    for step in failed_steps:
        ftype = step.error_context.get("failure_type", "UNKNOWN") if step.error_context else "UNKNOWN"
        counts[ftype] = counts.get(ftype, 0) + 1
        
    total_failures = len(failed_steps)
    categories = []
    if total_failures > 0:
        for ftype, count in counts.items():
            categories.append({
                "label": ftype.replace("_", " ").title(),
                "pct": round((count / total_failures) * 100, 1)
            })
    categories.sort(key=lambda x: x["pct"], reverse=True)
    
    return {
        "total_workflows": total_workflows,
        "failed_workflows": failed_workflows,
        "rescued_workflows": rescued_workflows,
        "recovery_success_rate": round(recovery_success_rate, 1),
        "average_recovery_time_seconds": round(avg_recovery_time, 1),
        "human_interventions": human_interventions,
        "failure_categories": categories[:4],
        "time_saved_hours": round(rescued_workflows * 0.5, 1)
    }

