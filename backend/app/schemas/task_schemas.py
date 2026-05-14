from pydantic import BaseModel
from typing import Dict

class TaskClaimRequest(BaseModel):
    pass

class TaskRewardResponse(BaseModel):
    task_id: str
    task_name: str
    rewards: Dict[str, int]
    pet_level_up: bool