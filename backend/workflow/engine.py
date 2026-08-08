import asyncio
import logging
from sqlalchemy.orm import Session
from database.session import SessionLocal
from models.domain import Workflow, WorkflowStep
from datetime import datetime

logger = logging.getLogger(__name__)

# The strict sequence of steps
WORKFLOW_SEQUENCE = ["ORDER", "PAYMENT", "INVENTORY", "INVOICE", "SHIPPING"]

async def execute_workflow_task(workflow_id: str):
    """
    Simulates the execution of a workflow pipeline.
    """
    db: Session = SessionLocal()
    try:
        workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
        if not workflow:
            logger.error(f"Workflow {workflow_id} not found for execution.")
            return

        for step_name in WORKFLOW_SEQUENCE:
            # 1. Re-fetch workflow to check if it was marked FAILED externally
            db.refresh(workflow)
            if workflow.status == "FAILED":
                logger.info(f"Workflow {workflow_id} is FAILED. Halting execution.")
                _mark_remaining_waiting(db, workflow_id, step_name)
                break
            
            if workflow.status == "PAUSED":
                logger.info(f"Workflow {workflow_id} is PAUSED. Halting execution.")
                break

            # 2. Fetch the current step
            step = db.query(WorkflowStep).filter(
                WorkflowStep.workflow_id == workflow_id,
                WorkflowStep.step_name == step_name
            ).first()

            if not step:
                continue

            # 3. Start the step
            step.status = "RUNNING"
            step.started_at = datetime.utcnow()
            workflow.current_step = step_name
            db.commit()

            # 4. Simulate work (network calls, processing)
            await asyncio.sleep(3)

            # 5. Re-check step status (in case simulate_failure was called during sleep)
            db.refresh(step)
            db.refresh(workflow)
            
            if step.status == "FAILED" or workflow.status == "FAILED":
                logger.info(f"Step {step_name} in Workflow {workflow_id} was failed externally.")
                _mark_remaining_waiting(db, workflow_id, step_name)
                break
            
            # 6. Complete the step
            step.status = "COMPLETED"
            step.completed_at = datetime.utcnow()
            db.commit()

        # If we finished the loop and the workflow isn't failed, mark it complete
        db.refresh(workflow)
        if workflow.status not in ["FAILED", "PAUSED"]:
            workflow.status = "COMPLETED"
            db.commit()
            logger.info(f"Workflow {workflow_id} completed successfully.")

    except Exception as e:
        logger.error(f"Error executing workflow {workflow_id}: {e}")
    finally:
        db.close()

def _mark_remaining_waiting(db: Session, workflow_id: str, current_failed_step: str):
    """
    Finds all steps after the current failed step and marks them as WAITING.
    """
    try:
        failed_idx = WORKFLOW_SEQUENCE.index(current_failed_step)
        remaining_steps = WORKFLOW_SEQUENCE[failed_idx + 1:]
        
        for r_step_name in remaining_steps:
            r_step = db.query(WorkflowStep).filter(
                WorkflowStep.workflow_id == workflow_id,
                WorkflowStep.step_name == r_step_name
            ).first()
            if r_step and r_step.status == "PENDING":
                r_step.status = "WAITING"
        db.commit()
    except ValueError:
        pass
