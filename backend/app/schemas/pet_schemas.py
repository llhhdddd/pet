from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict

class PetBase(BaseModel):
    name: str
    type: str

class PetCreate(PetBase):
    pass

class PetUpdate(BaseModel):
    name: Optional[str] = None
    health_value: Optional[int] = None
    hunger_value: Optional[int] = None
    mood_value: Optional[int] = None
    growth_value: Optional[int] = None

class PetResponse(PetBase):
    id: int
    level: int
    growth_value: int
    health_value: int
    hunger_value: int
    mood_value: int
    image_url: Optional[str]
    appearance_state: str
    unlocked_images: List[str]
    unlocked_privileges: List[str]
    evolution_progress: Optional[Dict]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class EvolutionProgress(BaseModel):
    next_evolution_level: Optional[int]
    progress_percent: float
    unlocked_evolutions: List[int]