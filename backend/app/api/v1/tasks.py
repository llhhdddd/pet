from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.task_service import TaskService
from app.schemas.task_schemas import TaskClaimRequest, TaskRewardResponse

router = APIRouter()

@router.get("/users/{user_id}/daily-tasks")
async def get_daily_tasks(user_id: int, db: AsyncSession = Depends(get_db)):
    service = TaskService(db)
    tasks = await service.check_daily_tasks(user_id)
    return {"tasks": tasks}

@router.post("/users/{user_id}/tasks/{task_id}/claim", response_model=TaskRewardResponse)
async def claim_task_reward(
    user_id: int,
    task_id: str,
    request: TaskClaimRequest,
    db: AsyncSession = Depends(get_db)
):
    service = TaskService(db)
    
    try:
        result = await service.claim_daily_reward(user_id, task_id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    return TaskRewardResponse(
        task_id=task_id,
        task_name=result.get("task_name", task_id),
        rewards={
            "personal_gold": result.get("gold_added", 0),
            "group_gold": 0,
            "growth_value": result.get("growth_added", 0)
        },
        pet_level_up=result.get("level_up", False)
    )