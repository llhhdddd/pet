from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.pet_service import PetService
from app.schemas.pet_schemas import PetCreate, PetUpdate, PetResponse

router = APIRouter()

@router.get("/pets/{pet_id}", response_model=PetResponse)
async def get_pet(pet_id: int, db: AsyncSession = Depends(get_db)):
    service = PetService(db)
    pet = await service.get_pet(pet_id)
    if not pet:
        raise HTTPException(status_code=404, detail="宠物不存在")
    
    response = PetResponse.from_orm(pet)
    response.evolution_progress = service.get_evolution_progress(pet)
    return response

@router.post("/pets", response_model=PetResponse, status_code=201)
async def create_pet(pet_create: PetCreate, db: AsyncSession = Depends(get_db)):
    service = PetService(db)
    pet = await service.create_pet(pet_create)
    response = PetResponse.from_orm(pet)
    response.evolution_progress = service.get_evolution_progress(pet)
    return response

@router.put("/pets/{pet_id}", response_model=PetResponse)
async def update_pet(pet_id: int, pet_update: PetUpdate, db: AsyncSession = Depends(get_db)):
    service = PetService(db)
    pet = await service.update_pet(pet_id, pet_update)
    if not pet:
        raise HTTPException(status_code=404, detail="宠物不存在")
    
    response = PetResponse.from_orm(pet)
    response.evolution_progress = service.get_evolution_progress(pet)
    return response

@router.post("/pets/{pet_id}/growth")
async def add_growth(pet_id: int, amount: int, db: AsyncSession = Depends(get_db)):
    service = PetService(db)
    pet = await service.add_growth(pet_id, amount)
    if not pet:
        raise HTTPException(status_code=404, detail="宠物不存在")
    
    response = PetResponse.from_orm(pet)
    response.evolution_progress = service.get_evolution_progress(pet)
    return response