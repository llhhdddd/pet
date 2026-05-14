from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.interaction_service import InteractionService
from app.schemas.interaction_schemas import InteractionRequest, PetInteractionResponse
from app.utils.exceptions import PetServiceException

router = APIRouter()

@router.post("/groups/{group_id}/pet/interact", response_model=PetInteractionResponse)
async def interact_with_pet(
    group_id: int,
    request: InteractionRequest,
    db: AsyncSession = Depends(get_db)
):
    service = InteractionService(db)
    
    try:
        result = await service.interact(group_id, request)
    except PetServiceException as e:
        raise HTTPException(status_code=400, detail=e.message)
    
    if not result.success:
        raise HTTPException(status_code=400, detail=result.message)
    
    return PetInteractionResponse(
        interaction_type=request.interaction_type,
        message=result.message,
        pet_state=result.pet_state,
        cost=result.cost
    )