from enum import Enum

class PredefinedAction(str, Enum):
    REQUEST_CUSTOMER_INFORMATION = "request_customer_information"
    VALIDATE_INFORMATION = "validate_information"
    RETRY_INVOICE = "retry_invoice"
    RESUME_SHIPPING = "resume_shipping"
    
    @classmethod
    def has_value(cls, value):
        return value in cls._value2member_map_

def execute_action(action: str, context: dict):
    """
    Mock function to simulate executing a backend recovery action.
    """
    if not PredefinedAction.has_value(action):
        raise ValueError(f"Action {action} is not a valid PredefinedAction")
    
    # In a real system, this would dispatch to the appropriate handler
    print(f"Executing recovery action: {action} with context: {context}")
    return True
