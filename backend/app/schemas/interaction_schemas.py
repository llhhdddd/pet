from pydantic import BaseModel
from typing import Optional, Dict

class InteractionRequest(BaseModel):
    interaction_type: str
    item_id: Optional[int] = None
    quantity: Optional[int] = 1

class InteractionResult(BaseModel):
    success: bool
    message: str
    pet_state: Optional[Dict] = None
    cost: Optional[Dict] = None

class PetInteractionResponse(BaseModel):
    interaction_type: str
    message: str
    pet_state: Dict
    cost: Optional[Dict]