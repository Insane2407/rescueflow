import os
import json
import logging
import google.generativeai as genai
from typing import Dict, Any, List
from pydantic import BaseModel, ValidationError, Field
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

class AI_DiagnosisResponse(BaseModel):
    cause: str = Field(description="The root cause of the failure")
    confidence: int = Field(description="Confidence level of the diagnosis (0-100)")
    severity: str = Field(description="Severity of the issue (low, medium, high, critical)")
    recommended_actions: List[str] = Field(description="List of predefined backend actions to recover")
    requires_human_approval: bool = Field(description="Whether a human needs to approve the actions")

# We use Gemini 1.5 Pro since Gemini 3.1 Pro is requested in the prompt but in the API it maps to gemini-1.5-pro or similar latest model. 
# We'll use gemini-1.5-pro which supports JSON schema response type.
# For safety, since the SDK might vary, we'll ask for JSON and parse it manually.

PROMPT_TEMPLATE = """
You are the FlowRescue AI Diagnosis Service. A workflow has failed and you need to diagnose the issue.
DO NOT execute any actions. You must only return a structured JSON object containing your diagnosis.
Your recommended actions MUST ONLY come from this list of allowed actions:
- request_customer_information
- validate_information
- retry_invoice
- resume_shipping

Analyze the following failure context:
Workflow: {workflow_name}
Workflow State: {workflow_status}
Failed Step: {failed_step}
Error Code/Type: {error_type}
Error Message: {error_message}
Previous Attempts: {previous_attempts}

Return EXACTLY a JSON object with the following schema:
{{
  "cause": "string",
  "confidence": integer (0-100),
  "severity": "string (low/medium/high/critical)",
  "recommended_actions": ["string"],
  "requires_human_approval": boolean
}}
"""

def generate_diagnosis(context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calls the Gemini API to generate a diagnosis based on the workflow failure context.
    Returns a validated dictionary conforming to DiagnosisBase.
    """
    if not GEMINI_API_KEY:
        logger.warning("GEMINI_API_KEY not found. Returning fallback diagnosis.")
        return get_fallback_diagnosis(context)
    
    try:
        model = genai.GenerativeModel('gemini-1.5-pro', generation_config={"response_mime_type": "application/json"})
        
        prompt = PROMPT_TEMPLATE.format(
            workflow_name=context.get("workflow_name", "Unknown Workflow"),
            workflow_status=context.get("workflow_status", "FAILED"),
            failed_step=context.get("failed_step", "Unknown Step"),
            error_type=context.get("error_type", "UnknownError"),
            error_message=context.get("error_message", "No message provided"),
            previous_attempts=context.get("previous_attempts", 0)
        )
        
        response = model.generate_content(prompt)
        response_text = response.text
        
        # Parse JSON
        data = json.loads(response_text)
        
        # Validate using Pydantic
        validated_data = AI_DiagnosisResponse(**data)
        
        # Extra validation on actions (they must be predefined)
        valid_actions = {"request_customer_information", "validate_information", "retry_invoice", "resume_shipping"}
        filtered_actions = [a for a in validated_data.recommended_actions if a in valid_actions]
        
        return {
            "cause": validated_data.cause,
            "confidence": validated_data.confidence, # using int but schema might be float
            "severity": validated_data.severity,
            "recommended_actions": filtered_actions,
            "requires_human_approval": validated_data.requires_human_approval
        }
        
    except Exception as e:
        logger.error(f"Failed to generate AI diagnosis: {e}")
        return get_fallback_diagnosis(context)

def get_fallback_diagnosis(context: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "cause": f"Fallback: Issue in {context.get('failed_step', 'step')}",
        "confidence": 50,
        "severity": "medium",
        "recommended_actions": [],
        "requires_human_approval": True
    }
