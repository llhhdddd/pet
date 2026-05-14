from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.models import Pet
from app.schemas.pet_schemas import PetCreate, PetUpdate, EvolutionProgress
from app.utils.pet_calculator import calculate_level, calculate_growth_efficiency

class PetService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_pet(self, pet_create: PetCreate) -> Pet:
        pet = Pet(
            name=pet_create.name,
            type=pet_create.type,
            level=1,
            growth_value=0,
            health_value=100,
            hunger_value=100,
            mood_value=100,
            image_url=self._get_initial_image(pet_create.type),
            appearance_state="normal"
        )
        self.db.add(pet)
        await self.db.commit()
        await self.db.refresh(pet)
        return pet
    
    async def get_pet(self, pet_id: int) -> Pet:
        result = await self.db.execute(select(Pet).where(Pet.id == pet_id))
        return result.scalar_one_or_none()
    
    async def update_pet(self, pet_id: int, pet_update: PetUpdate) -> Pet:
        pet = await self.get_pet(pet_id)
        if not pet:
            return None
        
        if pet_update.name:
            pet.name = pet_update.name
        if pet_update.health_value is not None:
            pet.health_value = max(0, min(100, pet_update.health_value))
        if pet_update.hunger_value is not None:
            pet.hunger_value = max(0, min(100, pet_update.hunger_value))
        if pet_update.mood_value is not None:
            pet.mood_value = max(0, min(100, pet_update.mood_value))
        if pet_update.growth_value is not None:
            pet.growth_value = pet_update.growth_value
            pet.level = calculate_level(pet.growth_value)
        
        await self.db.commit()
        await self.db.refresh(pet)
        return pet
    
    async def add_growth(self, pet_id: int, amount: int) -> Pet:
        pet = await self.get_pet(pet_id)
        if not pet:
            return None
        
        efficiency = calculate_growth_efficiency(pet)
        actual_amount = int(amount * efficiency)
        
        old_level = pet.level
        pet.growth_value += actual_amount
        pet.level = calculate_level(pet.growth_value)
        
        await self.db.commit()
        await self.db.refresh(pet)
        return pet
    
    def _get_initial_image(self, pet_type: str) -> str:
        return f"/static/pets/{pet_type}/{pet_type}_lv1.png"
    
    def get_evolution_progress(self, pet: Pet) -> EvolutionProgress:
        evolution_levels = [10, 20, 30, 50, 99]
        next_evolution = None
        progress = 0.0
        
        for level in evolution_levels:
            if pet.level < level:
                next_evolution = level
                required_growth = level * 100
                current_growth = pet.growth_value
                progress = min((current_growth / required_growth) * 100, 100)
                break
        
        unlocked = [l for l in evolution_levels if pet.level >= l]
        return EvolutionProgress(
            next_evolution_level=next_evolution,
            progress_percent=progress,
            unlocked_evolutions=unlocked
        )