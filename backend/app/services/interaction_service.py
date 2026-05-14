from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import random

from app.db.models import Pet, PetInteraction
from app.schemas.interaction_schemas import InteractionRequest, InteractionResult
from app.utils.exceptions import InsufficientGoldError, PetUnavailableError

class InteractionService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def interact(self, group_id: int, request: InteractionRequest) -> InteractionResult:
        group = await self._get_group(group_id)
        pet = await self._get_pet(group.pet_id)
        
        handlers = {
            "feed": self._feed,
            "play": self._play,
            "heal": self._heal,
            "clean": self._clean,
            "pet": self._pet
        }
        
        handler = handlers.get(request.interaction_type)
        if not handler:
            return InteractionResult(success=False, message="未知的互动类型")
        
        result = await handler(pet, group, request)
        
        if result["success"]:
            await self._log_interaction(pet.id, group_id, request.interaction_type, result)
        
        return InteractionResult(**result)
    
    async def _feed(self, pet, group, request):
        item = await self._get_shop_item(request.item_id)
        if not item:
            return {"success": False, "message": "道具不存在"}
        
        total_cost = item.price * (request.quantity or 1)
        if group.gold_balance < total_cost:
            raise InsufficientGoldError("小组金币不足")
        
        group.gold_balance -= total_cost
        hunger_increase = item.effect_value.get('hunger', 20) * (request.quantity or 1)
        pet.hunger_value = min(100, pet.hunger_value + hunger_increase)
        
        health_increase = item.effect_value.get('health', 0) * (request.quantity or 1)
        pet.health_value = min(100, pet.health_value + health_increase)
        
        await self.db.commit()
        
        return {
            "success": True,
            "message": f"喂食成功！饱食度+{hunger_increase}",
            "pet_state": {"health_value": pet.health_value, "hunger_value": pet.hunger_value, "mood_value": pet.mood_value},
            "cost": {"gold_spent": total_cost}
        }
    
    async def _play(self, pet, group, request):
        if pet.health_value < 21:
            raise PetUnavailableError("宠物生病中，无法玩耍")
        
        if pet.mood_value < 21:
            raise PetUnavailableError("宠物心情太差，拒绝玩耍")
        
        mood_increase = random.randint(15, 30)
        hunger_decrease = 5
        
        pet.mood_value = min(100, pet.mood_value + mood_increase)
        pet.hunger_value = max(0, pet.hunger_value - hunger_decrease)
        
        await self.db.commit()
        
        return {
            "success": True,
            "message": f"玩耍成功！心情+{mood_increase}",
            "pet_state": {"health_value": pet.health_value, "hunger_value": pet.hunger_value, "mood_value": pet.mood_value}
        }
    
    async def _heal(self, pet, group, request):
        heal_cost = 50
        if group.gold_balance < heal_cost:
            raise InsufficientGoldError("小组金币不足")
        
        group.gold_balance -= heal_cost
        health_increase = min(50, 100 - pet.health_value)
        pet.health_value += health_increase
        
        await self.db.commit()
        
        return {
            "success": True,
            "message": f"治疗成功！生命值+{health_increase}",
            "pet_state": {"health_value": pet.health_value, "hunger_value": pet.hunger_value, "mood_value": pet.mood_value},
            "cost": {"gold_spent": heal_cost}
        }
    
    async def _clean(self, pet, group, request):
        clean_cost = 20
        if group.gold_balance < clean_cost:
            raise InsufficientGoldError("小组金币不足")
        
        group.gold_balance -= clean_cost
        health_increase = random.randint(10, 20)
        pet.health_value = min(100, pet.health_value + health_increase)
        
        await self.db.commit()
        
        return {
            "success": True,
            "message": f"清洁成功！生命值+{health_increase}",
            "pet_state": {"health_value": pet.health_value, "hunger_value": pet.hunger_value, "mood_value": pet.mood_value},
            "cost": {"gold_spent": clean_cost}
        }
    
    async def _pet(self, pet, group, request):
        mood_increase = random.randint(5, 10)
        pet.mood_value = min(100, pet.mood_value + mood_increase)
        
        await self.db.commit()
        
        return {
            "success": True,
            "message": f"抚摸成功！心情+{mood_increase}",
            "pet_state": {"health_value": pet.health_value, "hunger_value": pet.hunger_value, "mood_value": pet.mood_value}
        }
    
    async def _log_interaction(self, pet_id, user_id, interaction_type, result):
        interaction = PetInteraction(
            pet_id=pet_id,
            user_id=user_id,
            interaction_type=interaction_type,
            interaction_data=result
        )
        self.db.add(interaction)
        await self.db.commit()
    
    async def _get_group(self, group_id):
        from app.db.models import Group
        result = await self.db.execute(select(Group).where(Group.id == group_id))
        return result.scalar_one_or_none()
    
    async def _get_pet(self, pet_id):
        result = await self.db.execute(select(Pet).where(Pet.id == pet_id))
        return result.scalar_one_or_none()
    
    async def _get_shop_item(self, item_id):
        from app.db.models import ShopItem
        result = await self.db.execute(select(ShopItem).where(ShopItem.id == item_id))
        return result.scalar_one_or_none()